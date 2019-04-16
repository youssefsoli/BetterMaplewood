const scriptList = [
    "src/averageCalculator.js",
    "src/liveMarkbookCalculator.js"
];

const injectScript = name => {
    let script = document.createElement('script'); // Create a script element
    script.src = chrome.extension.getURL(name); // Grab the absolute path to the script via the Chrome API
    (document.head || document.documentElement).appendChild(script); // Append the script to the <head> if it exists
    script.onload = () => {
        script.parentNode.removeChild(script); // Script removes itself off the page once loaded
    };
}

const injectScriptList = scriptList => {
    for(let i = 0; i < scriptList.length; i++)
        injectScript(scriptList[i]);
}

injectScriptList(scriptList);