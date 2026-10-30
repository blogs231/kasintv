param(
    [string]$Root = $PSScriptRoot,
    [switch]$Strict
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path
$Domain = 'https://kasin-tv.com'

function Get-AttributeValue {
    param([string]$Tag, [string]$Name)
    $pattern = '(?is)\b' + [regex]::Escape($Name) + '\s*=\s*(["''])(.*?)\1'
    $match = [regex]::Match($Tag, $pattern)
    if ($match.Success) { return $match.Groups[2].Value }
    return ''
}

function Get-MetaContent {
    param([string]$Html, [string]$Attribute, [string]$Value)
    foreach ($match in [regex]::Matches($Html, '(?is)<meta\b[^>]*>')) {
        if ((Get-AttributeValue $match.Value $Attribute) -ieq $Value) {
            return Get-AttributeValue $match.Value 'content'
        }
    }
    return ''
}

function Get-ExpectedUrl {
    param([System.IO.FileInfo]$File)
    $relative = $File.FullName.Substring($Root.Length).TrimStart('\', '/').Replace('\', '/')
    if ($relative -eq 'index.html') { return "$Domain/" }
    if ($relative.EndsWith('/index.html')) {
        return "$Domain/$($relative.Substring(0, $relative.Length - 10))"
    }
    return "$Domain/$relative"
}

function Resolve-LocalTarget {
    param([System.IO.FileInfo]$SourceFile, [string]$Url)
    $clean = ($Url -split '[?#]')[0]
    if (-not $clean) { return $null }
    if ($clean.StartsWith('/')) {
        $target = Join-Path $Root $clean.TrimStart('/')
    } else {
        $target = Join-Path $SourceFile.DirectoryName $clean
    }
    if (Test-Path -LiteralPath $target -PathType Container) {
        $target = Join-Path $target 'index.html'
    }
    return $target
}

$htmlFiles = @(
    Get-ChildItem -LiteralPath $Root -Recurse -File -Filter '*.html' |
        Where-Object { $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\.venv\\' }
)

$critical = [ordered]@{
    doctype          = @()
    charset          = @()
    viewport         = @()
    title_count      = @()
    description      = @()
    canonical        = @()
    robots           = @()
    h1               = @()
    header           = @()
    footer           = @()
    og_site_name     = @()
    og_title         = @()
    og_description   = @()
    og_url           = @()
    structured_data  = @()
    json_ld          = @()
    application_json = @()
    duplicate_ids    = @()
    mojibake         = @()
    missing_assets   = @()
    broken_links     = @()
}

$warnings = [ordered]@{
    title_length       = @()
    description_length = @()
}

$canonicalMap = @{}
$titleMap = @{}
$descriptionMap = @{}
$indexableCanonicals = @()

foreach ($file in $htmlFiles) {
    $relative = $file.FullName.Substring($Root.Length).TrimStart('\', '/').Replace('\', '/')
    $html = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName

    if ([regex]::Matches($html, '(?i)<!doctype\s+html>').Count -ne 1) { $critical.doctype += $relative }
    if (-not [regex]::IsMatch($html, '(?i)<meta\s+charset=["'']?utf-8')) { $critical.charset += $relative }
    if (-not (Get-MetaContent $html 'name' 'viewport')) { $critical.viewport += $relative }

    $titleMatches = [regex]::Matches($html, '(?is)<title\b[^>]*>(.*?)</title>')
    if ($titleMatches.Count -ne 1) {
        $critical.title_count += "$relative ($($titleMatches.Count))"
    } else {
        $title = ([regex]::Replace($titleMatches[0].Groups[1].Value, '<[^>]+>', '')).Trim()
        if (-not $title) { $critical.title_count += "$relative (empty)" }
        if ($title.Length -lt 20 -or $title.Length -gt 65) { $warnings.title_length += "$relative ($($title.Length))" }
        if (-not $titleMap.ContainsKey($title)) { $titleMap[$title] = @() }
        $titleMap[$title] += $relative
    }

    $description = Get-MetaContent $html 'name' 'description'
    if (-not $description) {
        $critical.description += $relative
    } else {
        if ($description.Length -lt 50 -or $description.Length -gt 170) {
            $warnings.description_length += "$relative ($($description.Length))"
        }
        if (-not $descriptionMap.ContainsKey($description)) { $descriptionMap[$description] = @() }
        $descriptionMap[$description] += $relative
    }

    $canonicalTags = @(
        [regex]::Matches($html, '(?is)<link\b[^>]*>') |
            Where-Object { (Get-AttributeValue $_.Value 'rel') -match '(?i)(^|\s)canonical(\s|$)' }
    )
    $expectedUrl = Get-ExpectedUrl $file
    if ($canonicalTags.Count -ne 1) {
        $critical.canonical += "$relative count=$($canonicalTags.Count)"
    } else {
        $canonical = Get-AttributeValue $canonicalTags[0].Value 'href'
        if ($canonical -ne $expectedUrl) { $critical.canonical += "$relative => $canonical expected $expectedUrl" }
        if (-not $canonicalMap.ContainsKey($canonical)) { $canonicalMap[$canonical] = @() }
        $canonicalMap[$canonical] += $relative
        $indexableCanonicals += $canonical
    }

    $robots = Get-MetaContent $html 'name' 'robots'
    if (-not $robots -or $robots -notmatch '(?i)index' -or $robots -match '(?i)noindex') {
        $critical.robots += "$relative => $robots"
    }

    $h1Count = [regex]::Matches($html, '(?i)<h1\b').Count
    if ($h1Count -ne 1) { $critical.h1 += "$relative ($h1Count)" }
    $headerCount = [regex]::Matches($html, '(?i)<header\b').Count
    if ($headerCount -ne 1) { $critical.header += "$relative ($headerCount)" }
    $footerCount = [regex]::Matches($html, '(?i)<footer\b').Count
    if ($footerCount -ne 1) { $critical.footer += "$relative ($footerCount)" }

    if (-not (Get-MetaContent $html 'property' 'og:site_name')) { $critical.og_site_name += $relative }
    if (-not (Get-MetaContent $html 'property' 'og:title')) { $critical.og_title += $relative }
    if (-not (Get-MetaContent $html 'property' 'og:description')) { $critical.og_description += $relative }
    $ogUrl = Get-MetaContent $html 'property' 'og:url'
    if (-not $ogUrl -or $ogUrl -ne $expectedUrl) { $critical.og_url += "$relative => $ogUrl" }

    $structuredDataBlocks = [regex]::Matches($html, '(?is)<script\b[^>]*type=["'']application/ld\+json["''][^>]*>(.*?)</script>')
    if ($structuredDataBlocks.Count -eq 0) { $critical.structured_data += $relative }
    foreach ($match in $structuredDataBlocks) {
        try { $null = $match.Groups[1].Value | ConvertFrom-Json }
        catch { $critical.json_ld += "$relative => $($_.Exception.Message)" }
    }
    foreach ($match in [regex]::Matches($html, '(?is)<script\b[^>]*type=["'']application/json["''][^>]*>(.*?)</script>')) {
        try { $null = $match.Groups[1].Value | ConvertFrom-Json }
        catch { $critical.application_json += "$relative => $($_.Exception.Message)" }
    }

    $ids = @(
        [regex]::Matches($html, '(?i)\bid\s*=\s*["'']([^"'']+)["'']') |
            ForEach-Object { $_.Groups[1].Value }
    )
    $duplicateIds = @($ids | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
    if ($duplicateIds.Count) { $critical.duplicate_ids += "$relative => $($duplicateIds -join ', ')" }
    $mojibakeMarkers = @(
        [string][char]0x00C2,
        ([string][char]0x00E2 + [string][char]0x20AC),
        ([string][char]0x00F0 + [string][char]0x0178),
        [string][char]0xFFFD
    )
    if ($mojibakeMarkers | Where-Object { $html.Contains($_) }) { $critical.mojibake += $relative }

    foreach ($tagMatch in [regex]::Matches($html, '(?is)<(?:script|img|link)\b[^>]*>')) {
        $tag = $tagMatch.Value
        $url = if ($tag -match '^(?is)<link') { Get-AttributeValue $tag 'href' } else { Get-AttributeValue $tag 'src' }
        if (-not $url -or $url -match '^(?i)(https?:)?//|^data:|^#') { continue }
        $target = Resolve-LocalTarget $file $url
        if ($target -and -not (Test-Path -LiteralPath $target -PathType Leaf)) {
            $critical.missing_assets += "$relative => $url"
        }
    }

    foreach ($match in [regex]::Matches($html, '(?i)href\s*=\s*["'']([^"'']+)["'']')) {
        $url = $match.Groups[1].Value
        if (-not $url -or $url -match '^(?i)#|mailto:|tel:|javascript:|https?://|//') { continue }
        $target = Resolve-LocalTarget $file $url
        if ($target -and -not (Test-Path -LiteralPath $target -PathType Leaf)) {
            $critical.broken_links += "$relative => $url"
        }
    }
}

$duplicateCanonicals = @(
    $canonicalMap.GetEnumerator() |
        Where-Object { $_.Value.Count -gt 1 } |
        ForEach-Object { "$($_.Key) => $($_.Value -join ', ')" }
)
$duplicateTitles = @(
    $titleMap.GetEnumerator() |
        Where-Object { $_.Value.Count -gt 1 } |
        ForEach-Object { "$($_.Key) => $($_.Value -join ', ')" }
)
$duplicateDescriptions = @(
    $descriptionMap.GetEnumerator() |
        Where-Object { $_.Value.Count -gt 1 } |
        ForEach-Object { "$($_.Value -join ', ')" }
)

$sitemapPath = Join-Path $Root 'sitemap.xml'
$sitemap = [xml](Get-Content -Raw -Encoding UTF8 -LiteralPath $sitemapPath)
$sitemapUrls = @($sitemap.urlset.url | ForEach-Object { [string]$_.loc })
$sitemapDuplicates = @($sitemapUrls | Group-Object | Where-Object Count -gt 1 | ForEach-Object Name)
$missingInSitemap = @($indexableCanonicals | Where-Object { $_ -notin $sitemapUrls } | Sort-Object -Unique)
$orphanSitemap = @($sitemapUrls | Where-Object { $_ -notin $indexableCanonicals } | Sort-Object -Unique)

$criticalCount = 0
$warningCount = 0
Write-Output "KaSin TV audit: $($htmlFiles.Count) HTML pages"
Write-Output "Canonical pages: $($indexableCanonicals.Count) | Sitemap URLs: $($sitemapUrls.Count)"
Write-Output ''
Write-Output 'Critical checks'
foreach ($key in $critical.Keys) {
    $values = @($critical[$key] | Sort-Object -Unique)
    $criticalCount += $values.Count
    Write-Output ("  {0,-20} {1,4}" -f $key, $values.Count)
    if ($values.Count) { $values | Select-Object -First 15 | ForEach-Object { Write-Output "    $_" } }
}

$sitemapChecks = [ordered]@{
    duplicate_canonicals = $duplicateCanonicals
    sitemap_duplicates    = $sitemapDuplicates
    missing_in_sitemap    = $missingInSitemap
    orphan_sitemap        = $orphanSitemap
}
foreach ($key in $sitemapChecks.Keys) {
    $values = @($sitemapChecks[$key])
    $criticalCount += $values.Count
    Write-Output ("  {0,-20} {1,4}" -f $key, $values.Count)
    if ($values.Count) { $values | Select-Object -First 15 | ForEach-Object { Write-Output "    $_" } }
}

Write-Output ''
Write-Output 'SEO warnings'
$warningSets = [ordered]@{
    title_length          = $warnings.title_length
    description_length    = $warnings.description_length
    duplicate_titles      = $duplicateTitles
    duplicate_descriptions = $duplicateDescriptions
}
foreach ($key in $warningSets.Keys) {
    $values = @($warningSets[$key] | Sort-Object -Unique)
    $warningCount += $values.Count
    Write-Output ("  {0,-24} {1,4}" -f $key, $values.Count)
    if ($values.Count) { $values | Select-Object -First 15 | ForEach-Object { Write-Output "    $_" } }
}

Write-Output ''
Write-Output "RESULT critical=$criticalCount warnings=$warningCount"
if ($criticalCount -gt 0 -or ($Strict -and $warningCount -gt 0)) { exit 1 }
