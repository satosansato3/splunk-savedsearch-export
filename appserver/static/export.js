require([
    "jquery",
    "splunkjs/mvc/savedsearchmanager",
    "splunkjs/mvc/simplexml/ready!"
], function ($, SavedSearchManager) {
        $(document).ready(function () {
            const exportFileInfoList = [
                { savedsearchname: "report1", filename: "report1_file" },
                { savedsearchname: "report2", filename: "report2_file" }
            ]

            let searchDoneCounter = 0;
            let lengthExportFileInfoList = exportFileInfoList.length;
            let searchResultList = [];

            for (var i = 0; i < lengthExportFileInfoList; i++) {
                let search = new SavedSearchManager({
                    id: exportFileInfoList[i]["savedsearchname"],
                    searchname: exportFileInfoList[i]["savedsearchname"],
                    app: "export-js"
                });
                let fileName = exportFileInfoList[i]["filename"]
                search.on('search:done', function () {
                    searchDoneCounter += 1
                    if (searchDoneCounter == lengthExportFileInfoList) {
                        $('#export').prop('disabled', false);
                    }
                    let myResults = search.data("results", { count: 0, output_mode: 'json_rows' });
                    myResults.on("data", function () {
                        let data = myResults.collection().toJSON();
                        searchResultList.push({
                            filename: fileName,
                            data: data
                        })
                    })
                });
            }

            $("#export").on("click", () => {
                for (var i = 0; i < searchResultList.length; i++) {
                    DownloadJSON2CSV(searchResultList[i]["data"], searchResultList[i]["filename"]);
                }
            });

            function DownloadJSON2CSV(objArray, fileName) {
                var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
                var str = '';
                var headers = new Array();
                for (var i = 0; i < array.length; i++) {
                    var line = '';
                    var data = array[i];
                    for (var index in data) {
                        headers.push(index);
                        if (line != '') {
                            line += ','
                        }
                        line += '"' + array[i][index] + '"';
                    }
                    str += line + ((array.length > 1) ? '\r\n' : '');
                    line = '';
                }

                headers = getHeaders(headers);
                str = headers + '\r\n' + str;
                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(str);
                hiddenElement.target = '_blank';
                hiddenElement.download = fileName + '.csv';
                hiddenElement.click();
            }

            function getHeaders(a) {
                var temp = {};
                for (var i = 0; i < a.length; i++)
                    temp[a[i]] = true;
                var r = [];
                for (var k in temp)
                    r.push(k);
                return r;
            }

        });

    }
)