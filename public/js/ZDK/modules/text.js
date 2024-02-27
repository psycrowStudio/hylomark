﻿define([

],
    function (
        
    ) {
        var MODULE_NAME = "text";

        var STRING_TOKEN_RX_PATTERN = /\{\{(\s?[a-zA-Z0-9\-\_]+\s?)\}\}/g; // replace markup tokens like {{ SOMETHING }} or {{SOMETHING}}

        var DEFAULT_STRING_TOKENS = {
            "SiteDomain": window.origin,
            //"StaticEndpoint":window["s5config"]["static_root"] || "CHANGE_ME"
        };
        
        var _txt = {
            alpha: {
                capitalizeFirstLetter: function (string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                },
                lowercaseFirstLetter: function (string) {
                    return string.charAt(0).toLowerCase() + string.slice(1);
                }
            },
            time: {
                isLeapYear: function (year) { return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0); },
                daysInMonth: function (month, year) { return new Date(year, month + 1, 0).getDate(); },
                formatFromUtc:function(isoString, format, timezone){
                    // requires luxon.js
                    // https://moment.github.io/luxon/docs/manual/formatting

                    var NAMED_FORMATS = {
                        DATE_SHORT: "DATE_SHORT",
                        DATE_MED: "DATE_MED",
                        DATE_MED_WITH_WEEKDAY: "DATE_MED_WITH_WEEKDAY",
                        DATE_FULL: "DATE_FULL",
                        DATE_HUGE: "DATE_HUGE",
                        TIME_SIMPLE: "TIME_SIMPLE",
                        TIME_WITH_SECONDS: "TIME_WITH_SECONDS",
                        TIME_WITH_SHORT_OFFSET: "TIME_WITH_SHORT_OFFSET",
                        TIME_WITH_LONG_OFFSET: "TIME_WITH_LONG_OFFSET",
                        TIME_24_SIMPLE: "TIME_24_SIMPLE",
                        TIME_24_WITH_SECONDS: "TIME_24_WITH_SECONDS",
                        TIME_24_WITH_SHORT_OFFSET: "TIME_24_WITH_SHORT_OFFSET",
                        TIME_24_WITH_LONG_OFFSET: "TIME_24_WITH_LONG_OFFSET",
                        DATETIME_SHORT: "DATETIME_SHORT",
                        DATETIME_MED: "DATETIME_MED",
                        DATETIME_FULL: "DATETIME_FULL",
                        DATETIME_HUGE: "DATETIME_HUGE",
                        DATETIME_SHORT_WITH_SECONDS: "DATETIME_SHORT_WITH_SECONDS",
                        DATETIME_MED_WITH_SECONDS: "DATETIME_MED_WITH_SECONDS",
                        DATETIME_FULL_WITH_SECONDS: "DATETIME_FULL_WITH_SECONDS",
                        DATETIME_HUGE_WITH_SECONDS: "DATETIME_HUGE_WITH_SECONDS"
                    };
                    
                    if(!luxon || !isoString) {
                        return "";
                    }

                    var luxDate = luxon.DateTime.fromISO(isoString, { zone: "utc" });

                    if(timezone){
                        luxDate = luxDate.setZone(timezone);
                    }
                    else {
                        luxDate = luxDate.toLocal();
                    }

                    if(format && NAMED_FORMATS.hasOwnProperty(format)){
                        return luxDate.toLocaleString(luxon.DateTime[format]);
                    }
                    else if(format){
                        return luxDate.toFormat(format);
                    }
                    else 
                    {
                        return luxDate.toLocaleString(luxon.DateTime.DATETIME_FULL); 
                    }
                }
            },
            number: {
                currency: {
                    currencyFormatter: new Intl.NumberFormat('en', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0
                    }),
                },
                cleanFormat: function (x) {
                    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                },
                abbreviateNumber: function (value) {
                    //https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn

                    var newValue = value;
                    if (value >= 1000 && !Number.isNaN(value)) {
                        value = Math.round(value);
                        var suffixes = ["", "k", "m", "b", "t"];
                        var suffixNum = Math.floor(("" + value).length / 3);
                        var shortValue = '';
                        for (var precision = 2; precision >= 1; precision--) {
                            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
                            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
                            if (dotLessShortValue.length <= 2) { break; }
                        }
                        if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);
                        newValue = shortValue + suffixes[suffixNum];
                    }
                    return newValue;
                },
            },
            random: {
                guid: function () {
                    // http://www.broofa.com/Tools/Math.uuid.js
                    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
                    var uuid = new Array(36), rnd = 0, r;
                    for (var i = 0; i < 36; i++) {
                        if (i === 8 || i === 13 || i === 18 || i === 23) {
                            uuid[i] = '-';
                        } else if (i === 14) {
                            uuid[i] = '4';
                        } else {
                            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                            r = rnd & 0xf;
                            rnd = rnd >> 4;
                            uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                        }
                    }
                    return uuid.join('');
                },
                hexColor: function () {
                    return ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
                },
                int: function (min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
            },
            sort: {
                ascending: function (a, b) { return ('' + a).localeCompare(b); },
                descending: function (a, b) { return ('' + b).localeCompare(a); },
                ascendingNumber: function (a, b) { return a - b; },
                descendingNumber: function (a, b) { return b - a; }
            },
            token: {
                addDefaultToken: function (key, value) {
                    //console.log('Updating Default String Token', key, value);
                    if (typeof key === "string" && typeof value === "string") {
                        DEFAULT_STRING_TOKENS[key] = value;
                    }
                },
                replace: function (markup, stringTable) {
                    stringTable = stringTable || {};

                    for (var prop in DEFAULT_STRING_TOKENS) {
                        stringTable[prop] = stringTable.hasOwnProperty(prop) ? stringTable[prop] : DEFAULT_STRING_TOKENS[prop];
                    }

                    return markup.replace(STRING_TOKEN_RX_PATTERN, function (match) {
                        var stripped = match.replace('{{', '').replace('}}', '').trim();
                        if (stringTable.hasOwnProperty(stripped)) {
                            return stringTable[stripped].indexOf('{{') > -1 ? _txt.token.replaceStringTokens(stringTable[stripped], stringTable) : stringTable[stripped];
                        }
                        else {
                            return match;
                        }
                    });
                }
            }
        };

        return _txt;
    }
);