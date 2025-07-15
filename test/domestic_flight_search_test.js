
"use strict";

import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import SearchflightPage from "../pages/search/search_flight_page.js";
import assert from "assert";


const MOCHA_TEST_TIMEOUT = 90000;

let driver;
/**@type {SearchflightPage} */
let searchflightPage;

suite("تست سوئیت - سایت فلای تودی", function () {
    this.timeout(MOCHA_TEST_TIMEOUT);

    suiteSetup(async function () {
         const options = new chrome.Options();
          if (process.env.HEADLESS === "true") {
            options.addArguments("--headless=new");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
        }
        driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();
        searchflightPage = new SearchflightPage(driver);
        await driver.get("https://www.flytoday.ir/");
    });

    // مراحل تست:
    // سایت فلای تودی باز می شود
    // صفحه ماکسیمایز می‌شود
    // اسلاید "پرواز داخلی" به صورت پیش فرض انتخاب شده نشان داده می شود
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // بر روی فیلتر "مبدا" کیلیک می شود
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // از روی لیست مقدار "تهران" جستجو و انتخاب می شود
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // بر روی فیلتر "مقصد" کیلیک می شود
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // از روی لیست مقدار "مشهد" جستجو و انتخاب می شود
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // بر روی فیلد "تاریخ" کیلیک می شود
    // از لیت یک تاریخ انتخاب می شود
    // بر روی دکمه "تایید" در فرم تاریخ کیلیک می شود 
    //بررسی می شود در صوت نمایش پیام پاپ آپ این فرم بسته شود
    // بر روی دکمه "جستجو" کیلیک می شود

    test("سرچ پرواز داخلی", async function () {

        const sourceFilterTitle = "مبدا";
        const destinationFilterTitle = "مقصد";
        const sourceLocation = "تهران";
        const destinationLocation = "مشهد";
        const expectedValueForsourceLocation = "تهران";
        const expectedValueFordestinationLocation = "مشهد";
        const dateFilterContent = "مرداد";
        const expectedValueForDate="8 مرداد";

        assert.ok(await searchflightPage.isDisplaying());
        await searchflightPage.clickOnMaxIcon();
        await searchflightPage.clickOnSourceFilterAndDestinationFilter(sourceFilterTitle);
        await searchflightPage.selectLocationInDropDown(sourceLocation);
        assert.ok(await searchflightPage.getDetailsFilters(sourceLocation, expectedValueForsourceLocation));
        await searchflightPage.clickOnSourceFilterAndDestinationFilter(destinationFilterTitle);
        await searchflightPage.selectLocationInDropDown(destinationLocation);
        assert.ok(await searchflightPage.getDetailsFilters(destinationLocation, expectedValueFordestinationLocation));
        await searchflightPage.selectDateInput();
        assert.ok(await searchflightPage.getDetailsFilters(dateFilterContent, expectedValueForDate));
        await searchflightPage.clickOnSearchButton();
        await searchflightPage.isSearchSuccessful();
    });
    //مرورگر کروم بسته می شود.
    suiteTeardown(async function () {
        await driver.quit();
    });
});
