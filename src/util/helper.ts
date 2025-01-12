
import { UserAction } from "../shared/types";
import browser from "webextension-polyfill";

export function getElementByXPath(xPath: string): HTMLElement | null {
    const result = document.evaluate(
        xPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );
    return result.singleNodeValue as HTMLElement | null;
}

function highlightElement(element: HTMLElement): void {
    // Save the original styles
    const originalBorder = element.style.border;
    const originalBackgroundColor = element.style.backgroundColor;

    // Apply highlight styles
    element.style.border = "2px solid red";
    element.style.backgroundColor = "rgba(255, 0, 0, 0.2)";

    // Remove the highlight after a delay
    setTimeout(() => {
        element.style.border = originalBorder;
        element.style.backgroundColor = originalBackgroundColor;
    }, 1000); // Highlight for 1 second
}

export function replayRecording(message: UserAction) {
    const { tabId } = message;
    const { actionType, selector, inputValue, coordinates, url } = message.action;
    const userActionWithXPath = ["click", "hover", "input", "select"]
    try {
        let element;
        
        // Handle tab navigation actions
        if (actionType === "tabSwitch" || actionType === "navigation") {
            if (tabId) {
                // Switch to the specified tab
                browser.tabs.update(tabId, { active: true })
                    .then(() => {
                        console.log(`Switched to tab ${tabId}`);
                    })
                    .catch((error) => {
                        console.error(`Error switching to tab ${tabId}:`, error);
                    });

                // If there is a navigation URL, navigate to that URL
                if (url) {
                    browser.tabs.update(tabId, { url })
                        .then(() => {
                            console.log(`Navigated to URL: ${url} in tab ${tabId}`);
                        })
                        .catch((error) => {
                            console.error(`Error navigating to URL ${url} in tab ${tabId}:`, error);
                        });
                }
            } else {
                console.error(`Tab ID missing for tabSwitch or navigation action`);
            }
        } else if (selector) {
            element = getElementByXPath(selector);
            console.log(element);
            if (!element) {
                console.error(`Element not found for XPath: ${selector}`);
                return;
            }
            highlightElement(element as HTMLElement);
        }

        switch (actionType) {
            case "click":
                (element as HTMLElement).click();
                console.log(`Clicked element at ${selector}`);
                break;

            case "input":
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                    element!.value = inputValue || "";
                    element.dispatchEvent(new Event("input", { bubbles: true }));
                    console.log(`Input set to "${inputValue}" at ${selector}`);
                } else {
                    console.error(`Element at ${selector} is not an input field.`);
                }
                break;

            case "scroll":
                const { x = 0, y = 0 } = coordinates || {};
                if (element instanceof HTMLElement) {
                    element.scrollTo({ top: y, left: x, behavior: "smooth" });
                    console.log(`Scrolled to (${x}, ${y}) within element at ${selector}`);
                } else {
                    console.error(`Element at ${selector} is not scrollable.`);
                }
                break;

            case "hover":
                (element as HTMLElement).dispatchEvent(
                    new MouseEvent("mouseover", { bubbles: true })
                );
                console.log(`Hovered over element at ${selector}`);
                break;

            default:
                console.error(`Unsupported action type: ${actionType}`);
        }
    } catch (error) {
        console.error(`Error replaying action:`, error);
    }
}


// Utility to get a unique selector for an element
export function getXPath(element: HTMLElement): string {
    if (element.id) {
        // Use the ID if it exists, as it is unique.
        return `//*[@id="${element.id}"]`;
    }

    if (element == document.body) {
        // Return root XPath for the body element.
        return "/html/body";
    }

    // Get the element's position among its siblings
    const siblings = Array.from(element.parentNode?.children || []);
    const index = siblings.filter((sibling) => sibling.tagName === element.tagName).indexOf(element) + 1;

    // Get XPath recursively for the parent, then append the current element
    const parentXPath = getXPath(element.parentElement as HTMLElement);
    const tagName = element.tagName.toLowerCase();

    // Include position if there are multiple siblings with the same tag
    const position = siblings.filter((sibling) => sibling.tagName === element.tagName).length > 1
        ? `[${index}]`
        : "";

    return `${parentXPath}/${tagName}${position}`;
}