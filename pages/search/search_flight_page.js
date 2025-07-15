"use strict";

import WebDriver from "selenium-webdriver";
import { until, By } from 'selenium-webdriver';
const SELENIUM_WAIT_TIMEOUT_VERY_SHORT = 2000;
const SELENIUM_WAIT_TIMEOUT_SHORT = 5000;
const SELENIUM_WAIT_TIMEOUT_MEDIUM = 20000;
const SELENIUM_WAIT_TIMEOUT_LONG = 50000;

/**
 * Represents the Searchflight page of flytoday web application.
 */
export default class SearchflightPage {
    /** 
     * @param {!WebDriver.ThenableWebDriver} driver the selenium webdriver used
     * by the page. 
     */
    constructor(driver) {
        this._driver = driver;
        this._selectors = {
            // Title 
            flyTodayPageXpath: "//div[@id='__next']//div[@id='back-to-top-anchor']//..//div[text()='پرواز داخلی']",
            filtertitleXpath: (filtertitle) => `//label[text()='${filtertitle}']`,
            iframeTitleId: "webpush-onsite",
            locationSelectionXpath: (location) => `//div[@role='button']//p[text()='${location}']`,
            // Data 
            //iconcCalendarXpath: "//span[@class='icon-calendar field_adornmentIcon__twlv1']",
            iconcCalendarXpath: "//*[@id='search-bar']/div/div/section/div[2]/div/div[2]/div/div[2]/div/button",
            calendarBodyXpath: "//div[@class='calendar-body_calendarWrapper__fRUc6']",
            dateinputXpath: "//*[@id='search-bar']/div/div/section/div[2]/div/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div/div[2]/button[8]/div/span[1]",
            // Button 
            confirmationButtonXpath: "//button[text()='تایید']",
            searchButtonXpath: "//button[text()='جستجو']",
            closePopupButtonCss: "button[class*='close'], .close-button-class",
            // Loading 
            spinLoadingXpath: "//*[@id='__next']/div[4]/div/div[1]/div/div/div[2]",
            // other 
            searchSuccessfullyXpath: "//div[@class='relative mb-3 md:mb-4']",
            filterContent: (content) => `//*[@id='search-bar']//span[contains(text(),'${content}')]`,
            dateContent: (content) => `//*[@id="__next"]//span[contains(text(),'${content}')]`,
        };
    }

    /**
     * Checks if the element specified by the XPath selector is present in the DOM within the timeout.
     * @async
     * @returns {Promise<boolean>} Returns `true` if the element is located within the timeout, otherwise `false`.
     */
    async isDisplaying() {
        try {
            try {
                await this._driver.wait(until.elementLocated(By.xpath(this._selectors.flyTodayPageXpath)), SELENIUM_WAIT_TIMEOUT_MEDIUM);
            } catch {
                console.error();
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Clicks on the maximize icon.
     * @async
     * @returns {Promise<void>}  A promise that will be resolved when the method has completed.
     */
    async clickOnMaxIcon() {
        await this._driver.manage().window().maximize();
    }

    /**
     * Handles and closes the discount/notification popup if it exists inside an iframe.
     *@async
     *@returns {Promise<void>}  A promise that will be resolved when the method has completed.
     */
    async handleDiscountIframeIfExists() {
        try {
            await this._driver.wait(until.elementLocated(By.id(this._selectors.iframeTitleId)), SELENIUM_WAIT_TIMEOUT_SHORT);
            const iframe = await this._driver.findElement(By.id(this._selectors.iframeTitleId));
            await this._driver.switchTo().frame(iframe);
            const closeButton = await this._driver.wait(until.elementLocated(By.css(this._selectors.closePopupButtonCss)), SELENIUM_WAIT_TIMEOUT_VERY_SHORT);
            await this._driver.wait(until.elementIsVisible(closeButton), SELENIUM_WAIT_TIMEOUT_VERY_SHORT);
            await closeButton.click();
            await this._driver.switchTo().defaultContent();
        } catch (e) {
            await this._driver.switchTo().defaultContent();
        }
    }

    /**
     * Clicks on a filter element (source or destination) identified by the filter title.
     * This method Handles and closes the discount iframe if it is present.
     * @param {!string} filtertitle - The title of the filter used to build the XPath selector.
     * @async
     * @returns {Promise<void>}  A promise that will be resolved when the method has completed.
     */
    async clickOnSourceFilterAndDestinationFilter(filtertitle) {
        await this.handleDiscountIframeIfExists();
        const sourceFilter = await this._driver.findElement(By.xpath(this._selectors.filtertitleXpath(filtertitle)));
        await sourceFilter.click();
    }

    /**
     * Checks whether the expected value exists in both the filter content and the date content.
     * This method first locates the filter and date elements using their respective XPath selectors. 
     * Then retrieves their text content and verifies whether the expected value is included in both.
     * @param {string} content - A unique identifier or label used to locate filter and date elements on the page.
     * @param {string} expectValue - The expected value to be searched within the retrieved filter and date content.
     * @async
     * @returns {Promise<boolean>} - `true` if the search success element is found, otherwise `false`.
     */
    async getDetailsFilters(content, expectValue) {
        const filterContent = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.filterContent(content))), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        const dateContent = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.dateContent(content))), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        const actualValueFilter = await filterContent.getText();
        const actualValueDate = await dateContent.getText();
        if (actualValueFilter.includes(expectValue) && actualValueDate.includes(expectValue)) {
            return true
        }
        else {
            return false
        }
    }

    /**
     * Selects an option in a dropdown based on the given location.
     * This method Handles and closes the discount iframe if it is present.
     * @param {!string} location - The location value used to build the XPath selector for the dropdown option.
     * @async
     * @returns {Promise<void>} A promise that will be resolved when the method has completed.
     */
    async selectLocationInDropDown(location) {
        await this.handleDiscountIframeIfExists();
        const commandSet = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.locationSelectionXpath(location))), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await this._driver.wait(until.elementIsVisible(commandSet), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await commandSet.click();
    }

    /**
     * Opens the calendar widget and selects a date.
     * This method Handles and closes the discount iframe if it is present.
     * @async
     * @returns {Promise<void>} A promise that will be resolved when the method has completed.
     */
    async selectDateInput() {
        await this.handleDiscountIframeIfExists();
        const iconcCalendar = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.iconcCalendarXpath)), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await iconcCalendar.click();
        await this._driver.wait(until.elementLocated(By.xpath(this._selectors.calendarBodyXpath)), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        const dateinput = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.dateinputXpath)), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await this._driver.wait(until.elementIsVisible(dateinput), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await dateinput.click();
        const confirmationButton = await this._driver.findElement(By.xpath(this._selectors.confirmationButtonXpath));
        await confirmationButton.click();
    }

    /**
     * Clicks on the search button on the page.
     * This method Handles and closes the discount iframe if it is present.
     * @async
     * @returns {Promise<void>} A promise that will be resolved when the method has completed.
     */
    async clickOnSearchButton() {
        await this.handleDiscountIframeIfExists();
        const searchButton = await this._driver.wait(until.elementLocated(By.xpath(this._selectors.searchButtonXpath)), SELENIUM_WAIT_TIMEOUT_MEDIUM);
        await searchButton.click();
    }

    /**
     * Waits for the loading spinner to appear and then disappear.
     * This method is used after clicking the search button to ensure that the results page has finished loading before continuing.
     * @async
     * @returns {Promise<void>} A promise that will be resolved when the method has completed.
     */
    async waitForLoad() {
        await this._driver.wait(until.elementLocated(By.xpath(this._selectors.spinLoadingXpath)), SELENIUM_WAIT_TIMEOUT_LONG);
        await this._driver.wait(until.stalenessOf(await this._driver.findElement(By.xpath(this._selectors.spinLoadingXpath))), SELENIUM_WAIT_TIMEOUT_LONG);
    }

    /**
     * Checks if the search was completed successfully by verifying
     * This method waits for the loading spinner to finish (via `waitForLoad`).
     * Then checks if the search success element is present on the page.
     * @async
     * @returns {Promise<boolean>} - `true` if the search success element is found, otherwise `false`.
     */
    async isSearchSuccessful() {
        await this.waitForLoad();
        try {
            await this._driver.wait(until.elementsLocated(By.xpath(this._selectors.searchSuccessfullyXpath)), SELENIUM_WAIT_TIMEOUT_LONG);
            return true;
        } catch {
            return false;
        }
    }
};
