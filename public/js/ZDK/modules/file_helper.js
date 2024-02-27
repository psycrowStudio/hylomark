define([], function () {
    
    var _knownWebImageFormats = ['.png', '.jpg', '.jpeg', '.gif'];  // does not include .ico & .bmp
    var _knownFileTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.bmp': 'image/bmp',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.zip': 'application/zip',
        '.html': 'text/html',
        '.txt': 'text/plain',
        '.csv': 'text/csv'
    };

    var _fileTypeIcons = {
        '.jpg': 'fa-file-image',
        '.jpeg': 'fa-file-image',
        '.js': 'fa-file-code',
        '.json': 'fa-file-code',
        '.css': 'fa-file-code',
        '.png': 'fa-file-image',
        '.gif': 'fa-file-image',
        '.pdf': 'fa-file-pdf',
        '.bmp': 'fa-file-image',
        '.svg': 'fa-file-image',
        '.ico': 'fa-file-image',
        '.zip': 'fa-file-archive',
        '.html': 'fa-file-code',
        '.txt': 'fa-file-alt',
        '.csv': 'fa-file-csv'
};

//TODO some more mappings for basic icons

//var binaryBaseType = 'application/octet-stream';   // may need to use this later
var _textBaseType = 'text/plain';
var _baseFileGlyph = 'fa-file';
var _baseFolderGlyph = 'fa-folder';

    var _file = {
        getWebFile: function (url) {
            try {
                return fetch(url).then(function (res) {
                    return res.blob();
                }).then(function (blob) {
                    return new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function () { resolve(this.result); }; // <--- `this.result` contains a base64 data URI
                        reader.readAsDataURL(blob);
                        reader.onerror = function (event) {
                            //resolve(""); //eat this and return empty
                            reject("Error retrieving file.");  // may blow up the whole upload
                        };
                    });
                });
            }
            catch (ex) {
                // likely unsupported ie11 etc
                return Promise.reject(null);
            }
        },
        getExtension: function (fileName) {
            var lastDotIndex = !fileName ? null : fileName.lastIndexOf('.');
            if (lastDotIndex < 0 || !lastDotIndex) {
                return '';
            }

            return fileName.substr(lastDotIndex);
        },
        getIconFromName: function (fileName) {
            var extension = this.getExtension(fileName).toLowerCase();
            console.log('icon for', extension);
            return _fileTypeIcons.hasOwnProperty(extension) ? _fileTypeIcons[extension] : _baseFileGlyph;
        },
        getMimeType: function (fileName) {
            var extension = this.getExtension(fileName).toLowerCase();
            return _knownFileTypes.hasOwnProperty(extension) ? _knownFileTypes[extension] : _textBaseType;
        },
        isWebImage: function (fileName) {
            var extension = this.getExtension(fileName).toLowerCase();
            return _knownWebImageFormats.indexOf(extension) > -1 ? true : false;
        },
        b64EncodeUnicode: function (str) {
            //https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
            // first we use encodeURIComponent to get percent-encoded UTF-8,
            // then we convert the percent encodings into raw bytes which
            // can be fed into btoa.
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode('0x' + p1);
                }));
        }
    };

    return _file;
}
);