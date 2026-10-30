import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const domain = 'https://kasin-tv.com';
const lastmod = '2026-07-09';
const tools = [];
const input = (label, type = 'number', placeholder = '') => ({ label, type, placeholder });
const add = (tool) => tools.push(tool);
const sentence = (value) => value.charAt(0).toLowerCase() + value.slice(1);

const textTools = [
  ['uppercase-text-converter','Uppercase Text Converter','uppercase','convert text to capital letters'],
  ['lowercase-text-converter','Lowercase Text Converter','lowercase','convert text to lowercase letters'],
  ['title-case-text-converter','Title Case Converter','titlecase','capitalize the main words in text'],
  ['sentence-case-text-converter','Sentence Case Converter','sentencecase','normalize text into sentence capitalization'],
  ['alternating-case-generator','Alternating Case Generator','alternating','create alternating uppercase and lowercase text'],
  ['inverse-case-converter','Inverse Case Converter','inversecase','swap uppercase letters with lowercase letters'],
  ['remove-spaces-from-text','Remove Spaces from Text','removespace','remove whitespace from text'],
  ['whitespace-normalizer','Whitespace Normalizer','normalizespace','replace repeated spacing with clean single spaces'],
  ['empty-line-remover','Empty Line Remover','emptylines','delete blank lines from pasted text'],
  ['sort-lines-alphabetically','Sort Lines Alphabetically','sortlinesaz','sort text lines from A to Z'],
  ['sort-lines-reverse-alphabetically','Reverse Alphabetical Line Sorter','sortlinesza','sort text lines from Z to A'],
  ['reverse-line-order','Reverse Line Order Tool','reverselines','reverse the order of lines'],
  ['line-number-generator','Line Number Generator','numberlines','add sequential numbers to every line'],
  ['trim-lines-online','Online Line Trimmer','trimlines','remove leading and trailing spaces from lines'],
  ['line-list-to-comma-list','Line List to Comma List','commalist','join separate lines into a comma-separated list'],
  ['comma-list-to-lines','Comma List to Lines','newline','split comma-separated values onto separate lines'],
  ['text-repeater-online','Text Repeater','repeat','repeat entered text three times'],
  ['initials-generator','Initials Generator','initials','create initials from words or a full name'],
  ['acronym-generator','Acronym Generator','acronym','build an acronym from a phrase'],
  ['palindrome-checker','Palindrome Checker','palindrome','check whether text reads the same backwards'],
  ['vowel-counter','Vowel Counter','vowels','count vowels in English text'],
  ['consonant-counter','Consonant Counter','consonants','count English consonants in text'],
  ['sentence-counter','Sentence Counter','sentences','estimate the number of sentences'],
  ['paragraph-counter','Paragraph Counter','paragraphs','count paragraphs separated by blank lines'],
  ['reading-time-calculator','Reading Time Calculator','readingtime','estimate reading time from word count'],
  ['speaking-time-calculator','Speaking Time Calculator','speakingtime','estimate speaking time for a script'],
  ['longest-word-finder','Longest Word Finder','longestword','find the longest word in text'],
  ['shortest-word-finder','Shortest Word Finder','shortestword','find the shortest word in text'],
  ['remove-punctuation-online','Punctuation Remover','punctuationremove','remove punctuation and symbols'],
  ['punctuation-counter','Punctuation Counter','punctuationcount','count punctuation marks and symbols'],
  ['sort-words-alphabetically','Alphabetical Word Sorter','sortwords','sort all recognized words alphabetically'],
  ['unique-word-extractor','Unique Word Extractor','uniquewords','list each word only once'],
  ['email-address-extractor','Email Address Extractor','extractemails','extract email addresses from text'],
  ['url-extractor','URL Extractor','extracturls','extract web addresses from text'],
  ['number-extractor','Number Extractor','extractnumbers','extract integers and decimal numbers'],
  ['hashtag-extractor','Hashtag Extractor','extracthashtags','extract hashtags from social text'],
  ['mention-extractor','Username Mention Extractor','extractmentions','extract @username mentions'],
  ['shuffle-lines-online','Random Line Shuffler','shufflelines','randomly shuffle the order of lines'],
  ['random-line-picker','Random Line Picker','randomline','select one random line from a list'],
  ['lexical-density-calculator','Lexical Density Calculator','lexdensity','compare unique words with total words'],
];
for (const [slug,title,op,purpose] of textTools) add({ slug,title,op,purpose,kind:'text',category:'Text Tools',inputs:[input('Text','textarea','Paste or type text here')] });

const converters = [
  ['meters-to-feet','Meters to Feet Converter','m','ft','linear',3.280839895],
  ['kilometers-to-miles','Kilometers to Miles Converter','km','mi','linear',0.621371192],
  ['centimeters-to-inches','Centimeters to Inches Converter','cm','in','linear',0.393700787],
  ['millimeters-to-inches','Millimeters to Inches Converter','mm','in','linear',0.0393700787],
  ['yards-to-meters','Yards to Meters Converter','yd','m','linear',0.9144],
  ['feet-to-centimeters','Feet to Centimeters Converter','ft','cm','linear',30.48],
  ['miles-to-kilometers','Miles to Kilometers Converter','mi','km','linear',1.609344],
  ['nautical-miles-to-kilometers','Nautical Miles to Kilometers','nmi','km','linear',1.852],
  ['microns-to-millimeters','Microns to Millimeters','μm','mm','linear',0.001],
  ['light-years-to-kilometers','Light Years to Kilometers','ly','km','linear',9.460730472e12],
  ['kilograms-to-pounds','Kilograms to Pounds','kg','lb','linear',2.204622622],
  ['grams-to-ounces','Grams to Ounces','g','oz','linear',0.0352739619],
  ['pounds-to-kilograms','Pounds to Kilograms','lb','kg','linear',0.45359237],
  ['ounces-to-grams','Ounces to Grams','oz','g','linear',28.349523125],
  ['tonnes-to-kilograms','Tonnes to Kilograms','t','kg','linear',1000],
  ['stone-to-kilograms','Stone to Kilograms','st','kg','linear',6.35029318],
  ['carats-to-grams','Carats to Grams','ct','g','linear',0.2],
  ['milligrams-to-grams','Milligrams to Grams','mg','g','linear',0.001],
  ['celsius-to-fahrenheit','Celsius to Fahrenheit','°C','°F','cf',null],
  ['fahrenheit-to-celsius','Fahrenheit to Celsius','°F','°C','fc',null],
  ['celsius-to-kelvin','Celsius to Kelvin','°C','K','ck',null],
  ['kelvin-to-celsius','Kelvin to Celsius','K','°C','kc',null],
  ['fahrenheit-to-kelvin','Fahrenheit to Kelvin','°F','K','fk',null],
  ['kelvin-to-fahrenheit','Kelvin to Fahrenheit','K','°F','kf',null],
  ['square-meters-to-square-feet','Square Meters to Square Feet','m²','ft²','linear',10.763910417],
  ['square-feet-to-square-meters','Square Feet to Square Meters','ft²','m²','linear',0.09290304],
  ['acres-to-hectares','Acres to Hectares','acre','ha','linear',0.404685642],
  ['hectares-to-acres','Hectares to Acres','ha','acre','linear',2.471053814],
  ['square-kilometers-to-square-miles','Square Kilometers to Square Miles','km²','mi²','linear',0.386102159],
  ['square-miles-to-square-kilometers','Square Miles to Square Kilometers','mi²','km²','linear',2.58998811],
  ['square-yards-to-square-meters','Square Yards to Square Meters','yd²','m²','linear',0.83612736],
  ['square-meters-to-acres','Square Meters to Acres','m²','acre','linear',0.000247105],
  ['liters-to-us-gallons','Liters to US Gallons','L','gal','linear',0.264172052],
  ['us-gallons-to-liters','US Gallons to Liters','gal','L','linear',3.785411784],
  ['milliliters-to-fluid-ounces','Milliliters to Fluid Ounces','mL','fl oz','linear',0.033814023],
  ['fluid-ounces-to-milliliters','Fluid Ounces to Milliliters','fl oz','mL','linear',29.573529563],
  ['cubic-meters-to-liters','Cubic Meters to Liters','m³','L','linear',1000],
  ['cups-to-milliliters','Cups to Milliliters','cup','mL','linear',236.5882365],
  ['tablespoons-to-milliliters','Tablespoons to Milliliters','tbsp','mL','linear',14.7867648],
  ['teaspoons-to-milliliters','Teaspoons to Milliliters','tsp','mL','linear',4.92892159],
  ['kilometers-per-hour-to-mph','Kilometers per Hour to MPH','km/h','mph','linear',0.621371192],
  ['mph-to-kilometers-per-hour','MPH to Kilometers per Hour','mph','km/h','linear',1.609344],
  ['meters-per-second-to-kph','Meters per Second to KPH','m/s','km/h','linear',3.6],
  ['knots-to-kilometers-per-hour','Knots to Kilometers per Hour','kn','km/h','linear',1.852],
  ['feet-per-second-to-meters-per-second','Feet per Second to Meters per Second','ft/s','m/s','linear',0.3048],
  ['bytes-to-kilobytes','Bytes to Kilobytes','B','KB','linear',1/1024],
  ['kilobytes-to-megabytes','Kilobytes to Megabytes','KB','MB','linear',1/1024],
  ['megabytes-to-gigabytes','Megabytes to Gigabytes','MB','GB','linear',1/1024],
  ['gigabytes-to-terabytes','Gigabytes to Terabytes','GB','TB','linear',1/1024],
  ['megabytes-to-kilobytes','Megabytes to Kilobytes','MB','KB','linear',1024],
];
for (const [slug,title,from,to,mode,factor] of converters) add({ slug,title,from,to,mode,factor,op:'convert',purpose:`convert ${from} values into ${to}`,kind:'converter',category:'Unit Converters',inputs:[input(`Value in ${from}`,'number','Enter a number')] });

const listCalculators = [
  ['sum-calculator','Sum Calculator','sum','add a list of numbers'],
  ['average-calculator-online','Average Calculator','average','calculate the arithmetic mean'],
  ['median-calculator-online','Median Calculator','median','find the middle number in a data set'],
  ['mode-calculator-online','Mode Calculator','mode','find the most frequent values'],
  ['range-calculator-online','Range Calculator','range','subtract the minimum from the maximum'],
  ['minimum-number-finder','Minimum Number Finder','minimum','find the smallest number'],
  ['maximum-number-finder','Maximum Number Finder','maximum','find the largest number'],
  ['number-product-calculator','Number Product Calculator','product','multiply a list of numbers'],
  ['population-variance-calculator','Population Variance Calculator','variance','calculate population variance'],
  ['standard-deviation-calculator','Standard Deviation Calculator','stddev','calculate population standard deviation'],
  ['geometric-mean-calculator','Geometric Mean Calculator','geometric','calculate a geometric mean'],
  ['harmonic-mean-calculator','Harmonic Mean Calculator','harmonic','calculate a harmonic mean'],
  ['root-mean-square-calculator','Root Mean Square Calculator','rms','calculate the quadratic mean'],
  ['number-count-calculator','Number Count Calculator','count','count numeric values in a list'],
  ['number-sorter-online','Online Number Sorter','sortnumbers','sort numbers from smallest to largest'],
];
for (const [slug,title,op,purpose] of listCalculators) add({slug,title,op,purpose,kind:'calculation',category:'Math Calculators',inputs:[input('Numbers','textarea','Enter numbers separated by spaces or commas')]});

const calc = [
  ['gcd-calculator','GCD Calculator','gcd','find the greatest common divisor',['First integer','Second integer']],
  ['lcm-calculator','LCM Calculator','lcm','find the least common multiple',['First integer','Second integer']],
  ['modulo-calculator','Modulo Calculator','modulo','calculate a division remainder',['Dividend','Divisor']],
  ['power-calculator','Power Calculator','power','raise a base to an exponent',['Base','Exponent']],
  ['nth-root-calculator','Nth Root Calculator','nthroot','calculate any real root',['Number','Root']],
  ['logarithm-calculator','Logarithm Calculator','logarithm','calculate a logarithm with a chosen base',['Number','Base']],
  ['percentage-change-calculator','Percentage Change Calculator','percentchange','measure percentage increase or decrease',['Original value','New value']],
  ['discount-price-calculator','Discount Price Calculator','discount','calculate a price after discount',['Original price','Discount percent']],
  ['markup-calculator','Markup Calculator','markup','add a markup percentage to cost',['Cost','Markup percent']],
  ['profit-margin-calculator','Profit Margin Calculator','margin','calculate gross profit margin',['Cost','Selling price']],
  ['tip-calculator-online','Tip Calculator','tip','calculate a tip amount',['Bill amount','Tip percent']],
  ['sales-tax-calculator','Sales Tax Calculator','salestax','add sales tax to an amount',['Amount','Tax percent']],
  ['simple-interest-calculator','Simple Interest Calculator','simpleinterest','calculate simple interest',['Principal','Annual rate percent','Years']],
  ['compound-interest-calculator','Compound Interest Calculator','compoundinterest','calculate compound balance',['Principal','Annual rate percent','Years','Compounds per year']],
  ['metric-bmi-calculator','Metric BMI Calculator','bmi','calculate body mass index from kilograms and centimeters',['Weight in kg','Height in cm']],
  ['ratio-simplifier','Ratio Simplifier','ratio','reduce a two-number ratio',['First number','Second number']],
  ['proportion-calculator','Proportion Calculator','proportion','solve A divided by B times C',['A','B','C']],
  ['fraction-to-decimal-calculator','Fraction to Decimal Calculator','fractiondecimal','convert numerator and denominator to decimal',['Numerator','Denominator']],
  ['decimal-to-percent-calculator','Decimal to Percent Calculator','decimalpercent','convert a decimal to percent',['Decimal']],
  ['percent-to-decimal-calculator','Percent to Decimal Calculator','percentdecimal','convert a percentage to decimal',['Percent']],
  ['square-calculator','Square Calculator','square','square a number',['Number']],
  ['cube-calculator','Cube Calculator','cube','cube a number',['Number']],
  ['square-root-calculator','Square Root Calculator','squareroot','calculate a principal square root',['Number']],
  ['cube-root-calculator','Cube Root Calculator','cuberoot','calculate a cube root',['Number']],
  ['factorial-calculator','Factorial Calculator','factorial','calculate the factorial of an integer',['Non-negative integer']],
  ['prime-number-checker','Prime Number Checker','prime','test whether an integer is prime',['Integer']],
  ['fibonacci-sequence-generator','Fibonacci Sequence Generator','fibonacci','generate Fibonacci terms',['Number of terms']],
  ['quadratic-equation-solver','Quadratic Equation Solver','quadratic','solve ax² + bx + c = 0',['a','b','c']],
  ['linear-equation-solver','Linear Equation Solver','linear','solve ax + b = 0',['a','b']],
  ['decimal-rounding-calculator','Decimal Rounding Calculator','round','round a number to chosen decimal places',['Number','Decimal places']],
  ['random-number-between','Random Number Between Two Values','randomnumber','generate an integer in an inclusive range',['Minimum','Maximum']],
  ['break-even-point-calculator','Break-Even Point Calculator','breakeven','calculate fixed cost divided by contribution margin',['Fixed costs','Price per unit','Variable cost per unit']],
  ['return-on-investment-calculator','ROI Calculator','roi','calculate return on investment percentage',['Initial investment','Final value']],
  ['cagr-calculator','CAGR Calculator','cagr','calculate compound annual growth rate',['Beginning value','Ending value','Years']],
  ['rule-of-72-calculator','Rule of 72 Calculator','doubling','estimate investment doubling time',['Annual return percent']],
];
for (const [slug,title,op,purpose,labels] of calc) add({slug,title,op,purpose,kind:'calculation',category:'Math Calculators',inputs:labels.map((label)=>input(label))});

const generators = [
  ['random-pin-generator','Random PIN Generator','pin','generate random four-digit PINs'],
  ['otp-generator-online','OTP Generator','otp','generate random six-digit one-time codes'],
  ['coupon-code-generator','Coupon Code Generator','coupon','generate uppercase coupon codes'],
  ['random-token-generator','Random Token Generator','token','generate random alphanumeric tokens'],
  ['api-key-generator','API Key Generator','apikey','generate placeholder API keys for development'],
  ['random-username-generator','Random Username Generator','username','generate simple random usernames'],
  ['secure-password-maker','Secure Password Maker','password','generate random 16-character passwords'],
  ['random-hex-color-generator','Random HEX Color Generator','hexcolor','generate random hexadecimal colors'],
  ['random-rgb-color-generator','Random RGB Color Generator','rgbcolor','generate random RGB colors'],
  ['css-gradient-generator-random','Random CSS Gradient Generator','gradient','generate two-color CSS gradients'],
  ['random-ipv4-generator','Random IPv4 Generator','ipv4','generate random IPv4 examples'],
  ['random-mac-address-generator','Random MAC Address Generator','mac','generate random MAC address examples'],
  ['invoice-number-generator','Invoice Number Generator','invoice','generate timestamp-friendly invoice numbers'],
  ['order-number-generator','Order Number Generator','order','generate random order references'],
  ['random-filename-generator','Random Filename Generator','filename','generate unique-looking text filenames'],
  ['lorem-ipsum-sentence-generator','Lorem Ipsum Generator','lorem','generate placeholder Latin text'],
  ['random-sentence-generator','Random Sentence Generator','sentence','pick a short sample sentence'],
  ['random-yes-no-generator','Random Yes or No Generator','yesno','make a random binary choice'],
  ['dice-roller-online','Online Dice Roller','dice','roll a six-sided die'],
  ['coin-flip-online','Online Coin Flip','coin','randomly choose heads or tails'],
  ['test-card-number-generator','Test Card Number Generator','card','generate display-only test number patterns'],
  ['random-cvv-generator','Random CVV Generator','cvv','generate display-only three-digit codes'],
  ['random-date-generator','Random Date Generator','date','generate random dates near the current year'],
  ['random-time-generator','Random Time Generator','time','generate random 24-hour times'],
  ['random-emoji-generator','Random Emoji Generator','emoji','pick random common emoji'],
  ['random-country-picker','Random Country Picker','country','pick a country from a sample list'],
  ['random-letter-generator','Random Letter Generator','letter','pick random uppercase letters'],
  ['random-number-generator-online','Random Number Generator','number','generate random non-negative integers'],
  ['css-box-shadow-generator-random','Random CSS Box Shadow Generator','cssshadow','generate CSS box-shadow values'],
  ['css-border-radius-generator','CSS Border Radius Generator','borderradius','generate random border-radius values'],
];
for (const [slug,title,op,purpose] of generators) add({slug,title,op,purpose,kind:'generator',category:'Generators',inputs:[input('How many results?','number','1')]});

const developers = [
  ['text-to-hex-converter','Text to Hex Converter','hexencode','encode Unicode text as hexadecimal bytes',['Text']],
  ['hex-to-text-converter','Hex to Text Converter','hexdecode','decode hexadecimal bytes to text',['Hexadecimal bytes']],
  ['text-to-binary-converter','Text to Binary Converter','binaryencode','encode text as eight-bit binary bytes',['Text']],
  ['binary-to-text-converter','Binary to Text Converter','binarydecode','decode space-separated binary bytes',['Binary bytes']],
  ['text-to-ascii-converter','Text to ASCII Code Converter','asciiencode','convert characters to Unicode code points',['Text']],
  ['ascii-to-text-converter','ASCII Codes to Text Converter','asciidecode','convert numeric code points to text',['Numeric codes']],
  ['json-string-escape-tool','JSON String Escape Tool','jsonescape','escape text for a JSON string',['Text']],
  ['rot13-converter-online','ROT13 Converter','rot13','apply reversible ROT13 letter substitution',['Text']],
  ['url-parser-online','URL Parser','urlparse','inspect the origin, path and query parameters of a URL',['Absolute URL']],
  ['query-string-parser','Query String Parser','queryparse','convert URL query parameters to JSON',['Query string']],
  ['jwt-decoder-online','JWT Payload Decoder','jwtdecode','decode the readable payload of a JWT without verification',['JWT']],
  ['regex-escape-tool','Regex Escape Tool','regexescape','escape regular-expression special characters',['Text']],
  ['html-minifier-online','HTML Minifier','htmlminify','remove comments and optional spacing from HTML',['HTML']],
  ['css-minifier-online','CSS Minifier','cssminify','remove CSS comments and optional spacing',['CSS']],
  ['javascript-minifier-basic','Basic JavaScript Minifier','jsminify','minify simple JavaScript',['JavaScript']],
  ['email-format-validator','Email Format Validator','emailvalidate','check a basic email address format',['Email address']],
  ['absolute-url-validator','Absolute URL Validator','urlvalidate','check whether text is a valid absolute URL',['URL']],
  ['ipv4-address-validator','IPv4 Address Validator','ipv4validate','validate dotted IPv4 address syntax',['IPv4 address']],
  ['uuid-validator-online','UUID Validator','uuidvalidate','validate standard UUID syntax and version',['UUID']],
  ['base64url-encoder','Base64URL Encoder','base64urlencode','encode text using URL-safe Base64',['Text']],
  ['base64url-decoder','Base64URL Decoder','base64urldecode','decode URL-safe Base64 to text',['Base64URL']],
  ['csv-to-html-table-generator','CSV to HTML Table Generator','htmltable','turn comma-separated rows into an HTML table',['CSV data']],
  ['csv-to-markdown-table','CSV to Markdown Table','markdowntable','turn comma-separated rows into a Markdown table',['CSV data']],
  ['meta-title-description-generator','Meta Title and Description Generator','metatags','create title and meta description tags',['Page title','Meta description']],
  ['canonical-tag-generator','Canonical Tag Generator','canonical','create a canonical link tag',['Canonical URL']],
  ['robots-txt-generator','Robots.txt Generator','robots','create a simple allow-all robots.txt file',['Website origin']],
  ['sha1-hash-generator','SHA-1 Hash Generator','sha1','calculate a SHA-1 digest locally',['Text']],
  ['sha256-hash-generator','SHA-256 Hash Generator','sha256','calculate a SHA-256 digest locally',['Text']],
  ['sha384-hash-generator','SHA-384 Hash Generator','sha384','calculate a SHA-384 digest locally',['Text']],
  ['sha512-hash-generator','SHA-512 Hash Generator','sha512','calculate a SHA-512 digest locally',['Text']],
];
for (const [slug,title,op,purpose,labels] of developers) add({slug,title,op,purpose,kind:'developer',category:'Developer Tools',inputs:labels.map((label)=>input(label,'textarea',`Enter ${label.toLowerCase()}`))});

if (tools.length !== 200) throw new Error(`Expected 200 tools, received ${tools.length}`);
if (new Set(tools.map((tool) => tool.slug)).size !== tools.length) throw new Error('Duplicate generated tool slugs found');

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const renderInput = (field, index) => field.type === 'textarea'
  ? `<textarea data-tool-input id="input${index}" placeholder="${escape(field.placeholder)}"></textarea>`
  : `<input data-tool-input id="input${index}" type="${field.type}" step="any" placeholder="${escape(field.placeholder)}">`;
const header = `<!-- START SITE GLOBAL HEADER -->
<header class="site-global-header"><div><a href="/"><img src="/favicon.ico" alt="KaSin TV logo"><span><span>KaSin TV</span><span>Free online tools</span></span></a><nav class="site-nav" aria-label="Primary navigation"><a href="/">Home</a><a href="/all-tools.html">All Tools</a><a href="/password-generator.html">Password</a><a href="/qr-code-generator.html">QR Code</a><a href="/nepal-salary-tax-calculator.html">Nepal Tax</a><a href="/about-us.html">About</a><a href="/contact-us.html">Contact</a></nav></div></header>
<!-- END SITE GLOBAL HEADER -->`;
const footer = `<!-- START SITE GLOBAL FOOTER -->
<footer class="site-global-footer"><div class="footer-content"><div><p>KaSin TV</p><p>Fast, private and free browser-based utilities at kasin-tv.com.</p></div><div><p>Tools</p><ul><li><a href="/all-tools.html">Browse All Tools</a></li></ul></div><div><p>Information</p><ul><li><a href="/about-us.html">About</a></li><li><a href="/privacy.html">Privacy</a></li><li><a href="/terms.html">Terms</a></li><li><a href="/disclaimer.html">Disclaimer</a></li><li><a href="/contact-us.html">Contact</a></li></ul></div></div><div>© 2026 KaSin TV · kasin-tv.com</div></footer>
<!-- END SITE GLOBAL FOOTER -->`;

for (const tool of tools) {
  const description = `Use the free ${tool.title} to ${tool.purpose}. Fast, private browser processing on kasin-tv.com with no signup required.`;
  const related = tools.filter((candidate) => candidate.category === tool.category && candidate.slug !== tool.slug).slice(0,3);
  const config = JSON.stringify(tool).replace(/</g,'\\u003c');
  const structured = JSON.stringify({"@context":"https://schema.org","@graph":[
    {"@type":"SoftwareApplication","name":tool.title,"url":`${domain}/${tool.slug}.html`,"description":description,"applicationCategory":tool.category === 'Developer Tools' ? 'DeveloperApplication' : 'UtilitiesApplication',"operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}},
    {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":`${domain}/`},{"@type":"ListItem","position":2,"name":"All Tools","item":`${domain}/all-tools.html`},{"@type":"ListItem","position":3,"name":tool.title,"item":`${domain}/${tool.slug}.html`}]}
  ]}).replace(/</g,'\\u003c');
  const fields = tool.inputs.map((field,index)=>`<div class="tool-field${field.type === 'textarea' ? ' full' : ''}"><label for="input${index}">${escape(field.label)}</label>${renderInput(field,index)}</div>`).join('');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(tool.title)} Online Free | KaSin TV</title>
  <meta name="description" content="${escape(description)}">
  <meta name="author" content="KaSin TV"><meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${domain}/${tool.slug}.html">
  <meta property="og:type" content="website"><meta property="og:site_name" content="KaSin TV"><meta property="og:title" content="${escape(tool.title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${domain}/${tool.slug}.html">
  <meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(tool.title)}"><meta name="twitter:description" content="${escape(description)}">
  <link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/tool-pages.css">
  <script type="application/ld+json">${structured}</script>
</head>
<body data-generated-tool="${tool.slug}">
  ${header}
  <main class="seo-tool-page">
    <nav class="tool-breadcrumb" aria-label="Breadcrumb"><a href="/">kasin-tv.com</a><span>›</span><a href="/all-tools.html">All Tools</a><span>›</span><span>${escape(tool.title)}</span></nav>
    <section class="tool-page-hero"><div class="tool-page-icon">${escape(tool.category.slice(0,2).toUpperCase())}</div><h1>${escape(tool.title)}</h1><p>${escape(description)}</p></section>
    <section class="seo-tool-card" aria-labelledby="toolHeading"><h2 id="toolHeading">Use the ${escape(tool.title)}</h2><div class="tool-grid">${fields}<div class="tool-field full"><label for="toolOutput">Result</label><textarea id="toolOutput" readonly placeholder="Your result appears here"></textarea></div></div><div class="tool-actions"><button id="runTool" class="tool-button">Calculate / Convert</button><button id="copyTool" class="tool-button secondary">Copy result</button><button id="clearTool" class="tool-button danger">Clear</button></div><div id="toolStatus" class="tool-status" role="status"></div></section>
    <article class="tool-guide"><h2>About this ${escape(tool.title)}</h2><p>${escape(description)} The tool is designed for quick everyday use and processes the supplied values on the current device.</p><h3>How to use it</h3><ol><li>Enter the requested value or text.</li><li>Select “Calculate / Convert”.</li><li>Review and copy the result.</li></ol><h3>Is this tool free and private?</h3><p>Yes. KaSin TV provides this utility without signup. The calculation runs in your browser and the entered content is not sent to a KaSin TV calculation server.</p><h3>Important accuracy note</h3><p>Review results before using them for financial, medical, legal, academic or production decisions. Rounding and input conventions can affect an answer.</p><div class="related-tools">${related.map((item)=>`<a href="/${item.slug}.html">${escape(item.title)}</a>`).join('')}<a href="/all-tools.html">Browse all tools</a></div></article>
  </main>
  ${footer}
  <script id="toolConfig" type="application/json">${config}</script>
  <script src="/generated-tool-runtime.js" defer></script>
</body>
</html>`;
  fs.writeFileSync(path.join(root, `${tool.slug}.html`), html, 'utf8');
}

const grouped = Object.groupBy ? Object.groupBy(tools, (tool)=>tool.category) : tools.reduce((out,tool)=>((out[tool.category]??=[]).push(tool),out),{});
const categoryMeta = {
  'Text Tools': { icon: 'fa-font', intro: 'Clean, format, count, extract and transform text directly from the homepage.' },
  'Unit Converters': { icon: 'fa-right-left', intro: 'Fast length, weight, temperature, area, volume, speed and data converters.' },
  'Math Calculators': { icon: 'fa-calculator', intro: 'Everyday arithmetic, statistics, finance and number calculators for quick answers.' },
  'Generators': { icon: 'fa-wand-magic-sparkles', intro: 'Create random codes, colors, placeholders and sample values instantly.' },
  'Developer Tools': { icon: 'fa-code', intro: 'Encoding, validation, parsing, hashing and markup helpers for developers.' },
};
const legacyHomepageTools = {
  'Text Tools': [
    ['find-replace','Find and Replace','find and replace words or phrases in text','fa-search-plus'],
    ['morse-code-converter','Morse Code Converter','convert text to and from Morse code','fa-signal'],
    ['reverse-text','Text Reverser','reverse text characters or lines','fa-rotate-left'],
    ['word-counter','Word Counter','count words, characters and lines','fa-text-width'],
    ['online-notepad-word-counter','Online Notepad','write notes and count text while typing','fa-pen-to-square'],
    ['character-counter','Character Counter','count characters with or without spaces','fa-text-width'],
    ['case-converter','Case Converter','convert text between uppercase, lowercase and title case','fa-font'],
    ['duplicate-line-remover','Duplicate Line Remover','remove repeated lines from pasted text','fa-filter-circle-xmark'],
    ['word-frequency-counter','Word Frequency Counter','find repeated words and keyword counts','fa-chart-column'],
  ],
  'Math Calculators': [
    ['percentage-calculator','Percentage Calculator','calculate percentages, increases and decreases','fa-percent'],
  ],
  'Generators': [
    ['password-generator','Password Generator','create strong random passwords','fa-key'],
    ['qr-code-generator','QR Code Generator','create QR codes from text or links','fa-qrcode'],
    ['qr-code-reader','QR Code Reader','read QR codes from images','fa-camera'],
    ['code-128-barcode-generator','Code 128 Barcode Generator','create Code 128 barcode images','fa-barcode'],
    ['code-39-barcode-generator','Code 39 Barcode Generator','create Code 39 barcode images','fa-barcode'],
    ['barcode-scanner','Barcode Scanner','scan and read barcodes online','fa-expand'],
    ['label-maker','Label Maker','create printable labels quickly','fa-tag'],
  ],
  'Developer Tools': [
    ['base16-encoder','Base16 Encoder','encode text as hexadecimal Base16','fa-lock'],
    ['base16-decoder','Base16 Decoder','decode Base16 hexadecimal text','fa-unlock'],
    ['base32-encoder','Base32 Encoder','encode text into Base32 format','fa-lock'],
    ['base32-decoder','Base32 Decoder','decode Base32 text back to normal text','fa-unlock'],
    ['base64-encoder-decoder','Base64 Encoder & Decoder','encode or decode Base64 text locally','fa-code'],
    ['html-encode-decode','HTML Encode/Decode','convert HTML entities and special characters','fa-file-code'],
    ['url-encode-decode','URL Encode/Decode','encode or decode URL-safe text','fa-link'],
    ['slug-generator','SEO Slug Generator','create clean URL slugs from titles','fa-link'],
    ['json-formatter-validator','JSON Formatter & Validator','format and validate JSON data','fa-brackets-curly'],
    ['uuid-generator','UUID v4 Generator','generate random UUID identifiers','fa-fingerprint'],
    ['unix-timestamp-converter','Unix Timestamp Converter','convert Unix timestamps and dates','fa-clock'],
  ],
};
const dedupeHomepageTools = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const slug = item.slug ?? item[0];
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
};
const directorySections = Object.entries(grouped).map(([category,items])=>`<section class="seo-tool-card tool-category"><h2>${escape(category)}</h2><div class="directory-grid">${items.map((tool)=>`<a class="directory-card" href="/${tool.slug}.html"><strong>${escape(tool.title)}</strong><span>${escape(tool.purpose)}</span></a>`).join('')}</div></section>`).join('');
const homepageGeneratedSections = Object.entries(grouped).map(([category,items]) => {
  const meta = categoryMeta[category] ?? { icon: 'fa-layer-group', intro: `Browse ${items.length} free ${category.toLowerCase()} from KaSin TV.` };
  const homepageItems = dedupeHomepageTools([
    ...(legacyHomepageTools[category] ?? []).map(([slug,title,purpose,icon]) => ({ slug,title,purpose,icon })),
    ...items.map((tool) => ({ ...tool, icon: meta.icon })),
  ]);
  const cards = homepageItems.map((tool)=>`                    <a href="${tool.slug}.html" class="tool-card hover-lift flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white">
                        <i class="fas ${tool.icon ?? meta.icon} w-8 shrink-0 text-center text-brand-600 text-lg opacity-80 mt-0.5"></i>
                        <span class="min-w-0">
                            <span class="block text-sm font-semibold text-gray-700 leading-snug">${escape(tool.title)}</span>
                            <span class="block text-xs text-gray-500 leading-snug mt-1">${escape(sentence(tool.purpose))}.</span>
                        </span>
                    </a>`).join('\n');
  return `            <section class="bg-white rounded-3xl p-6 md:p-8 smooth-shadow border border-gray-100 tool-category">
                <div class="flex flex-wrap items-center justify-between mb-4 gap-3">
                    <h2 class="text-base font-bold text-gray-900 flex items-center"><i class="fas ${meta.icon} text-brand-600 mr-3 opacity-80"></i>${escape(category)}</h2>
                    <span class="tool-count text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">${homepageItems.length} tools</span>
                </div>
                <p class="text-sm text-gray-500 mb-5 leading-relaxed">${escape(meta.intro)}</p>
                <div class="grid md:grid-cols-2 gap-3">
${cards}
                </div>
            </section>`;
}).join('\n\n');
const directoryDescription = 'Browse 200 free online text, developer, conversion, calculation and generator tools from KaSin TV at kasin-tv.com.';
const directoryStructured = JSON.stringify({"@context":"https://schema.org","@type":"CollectionPage","name":"200 Free Online Tools","url":`${domain}/all-tools.html`,"description":directoryDescription,"isPartOf":{"@type":"WebSite","name":"KaSin TV","url":`${domain}/`}}).replace(/</g,'\\u003c');
const directoryHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>200 Free Online Tools | KaSin TV</title><meta name="description" content="${directoryDescription}"><meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${domain}/all-tools.html"><meta property="og:type" content="website"><meta property="og:site_name" content="KaSin TV"><meta property="og:title" content="200 Free Online Tools"><meta property="og:description" content="${directoryDescription}"><meta property="og:url" content="${domain}/all-tools.html"><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/tool-pages.css"><script type="application/ld+json">${directoryStructured}</script></head><body>${header}<main class="seo-tool-page"><nav class="tool-breadcrumb"><a href="/">kasin-tv.com</a><span>›</span><span>All Tools</span></nav><section class="tool-page-hero"><div class="tool-page-icon">200</div><h1>200 Free Online Tools</h1><p>${directoryDescription}</p></section><section class="seo-tool-card"><label class="tool-field" for="directorySearch"><span>Search tools</span><input id="directorySearch" type="search" placeholder="Search by tool name or purpose"></label><div id="directoryStatus" class="tool-status"></div></section>${directorySections}</main>${footer}<script>const s=document.getElementById('directorySearch'),cards=[...document.querySelectorAll('.directory-card')],status=document.getElementById('directoryStatus');s.addEventListener('input',()=>{const q=s.value.trim().toLowerCase();let n=0;cards.forEach(c=>{const show=c.textContent.toLowerCase().includes(q);c.hidden=!show;if(show)n++});status.textContent=q?n+' matching tools':''});</script></body></html>`;
fs.writeFileSync(path.join(root,'all-tools.html'),directoryHtml,'utf8');
fs.writeFileSync(path.join(root,'generated-tools-manifest.json'),JSON.stringify({generatedAt:lastmod,count:tools.length,tools},null,2),'utf8');

const sitemapPath = path.join(root,'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath,'utf8').replace(/\s*<!-- START GENERATED 200 TOOLS -->[\s\S]*?<!-- END GENERATED 200 TOOLS -->\s*/,'\n');
const generatedUrls = [{slug:'all-tools'},...tools].map((tool)=>`    <url><loc>${domain}/${tool.slug}.html</loc><lastmod>${lastmod}</lastmod></url>`).join('\n');
sitemap = sitemap.replace('</urlset>',`\n    <!-- START GENERATED 200 TOOLS -->\n${generatedUrls}\n    <!-- END GENERATED 200 TOOLS -->\n</urlset>`);
fs.writeFileSync(sitemapPath,sitemap,'utf8');

const indexPath = path.join(root,'index.html');
let index = fs.readFileSync(indexPath,'utf8');
index = index.replaceAll('100+', '200+');
index = index.replace(/href="https:\/\/kasin-tv\.com\/([^"#?]+\.html)"/g, 'href="$1"');
const promoStart = index.indexOf('<!-- START 200 TOOLS PROMO -->');
if (promoStart >= 0) {
  const promoEndMarker = '<!-- END 200 TOOLS PROMO -->';
  const promoEnd = index.indexOf(promoEndMarker,promoStart);
  if (promoEnd < 0) throw new Error('Homepage generated-tools promotion has no closing marker');
  index = index.slice(0,promoStart) + index.slice(promoEnd + promoEndMarker.length);
}
const duplicateHomepageSections = [
  'Text Encoding & Decoding',
  'Text Processing',
  'Barcode & QR Codes',
  'New Productivity & Developer Tools',
];
index = index.replace(/<section class="[^"]*tool-category[^"]*">[\s\S]*?<\/section>\s*/g, (block) => {
  const text = block.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return duplicateHomepageSections.some((heading) => text.includes(heading)) ? '\n' : block;
});
const promo = `
            <!-- START 200 TOOLS PROMO -->
${homepageGeneratedSections}
            <!-- END 200 TOOLS PROMO -->
`;
const mainClose = /(\r?\n\s*<\/div>\r?\n\r?\n\s*<\/main>)/;
if (!mainClose.test(index)) throw new Error('Unable to find homepage tool-category closing block');
index = index.replace(mainClose,`${promo}$1`);
fs.writeFileSync(indexPath,index,'utf8');

const htmlFiles = [];
const collectHtml = (directory) => {
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    const fullPath = path.join(directory,entry.name);
    if (entry.isDirectory()) collectHtml(fullPath);
    else if (entry.name.endsWith('.html')) htmlFiles.push(fullPath);
  }
};
collectHtml(root);
for (const htmlPath of htmlFiles) {
  let html = fs.readFileSync(htmlPath,'utf8');
  if (!html.includes('<meta property="og:site_name" content="KaSin TV">')) {
    html = html.replace('</head>','  <meta property="og:site_name" content="KaSin TV">\n</head>');
    fs.writeFileSync(htmlPath,html,'utf8');
  }
}

console.log(`Generated ${tools.length} tool pages, all-tools.html, manifest, sitemap entries and homepage promotion. Verified KaSin TV site-name metadata across ${htmlFiles.length} pages.`);

const financialGenerator = path.join(root, 'generate-nepal-financial-calculators.mjs');
if (fs.existsSync(financialGenerator) && process.env.SKIP_FINANCIAL_GENERATOR !== '1') {
  await import(`file://${financialGenerator.replace(/\\/g, '/')}`);
}
