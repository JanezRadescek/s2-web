//-------------      ON READY     -------------------------
$(document).ready(function ()
    {
        GLOBAL_logedin = false;
        GLOBAL_accountname = null;
        GLOBAL_password = null;

        GLOBAL_fileType = "";
        GLOBAL_fileName = "";

        changeHTML();
        customEvents();
    }

);

function changeHTML()
{
    fixDisplays();
}

function customEvents()
{
    //black events are all event not set up in here. basicly events that shoudnt even exist

    //show login screen
    $("#loginLink").on("click", function()
    {
        $("#loginDiv").show();
    });

    //hide login screen
    $("#loginDiv, #loginCancel").on("click", function(e)
    {
        if (e.target != this)
        {
            return false;
        }

        $("#loginDiv").hide();
        // this.css("display", "none");
    });

    //connect enter with login
    $("#loginDiv input").on("keypress", function (e) {
        if(e.keyCode == 13)
        {
            $("#loginLogin").click();
        }

    })

    //try to login
    $("#loginLogin").on("click", function ()
    {
        let fd = new FormData();
        let tmp_accountname = $("#accountName").val();
        let tmp_password = $("#password").val();

        fd.append("accountname", tmp_accountname);
        fd.append("password", tmp_password);

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {

                let res = JSON.parse(this.response);

                if(res.registered == "yes")
                {
                    $("#loginDiv").hide();
                    $("#loginNav").hide();
                    $("#tmpUser").show();
                    $("#tmpUserName").text(tmp_accountname);
                    $("#onlineFilesDiv").show();

                    GLOBAL_logedin = true;
                    GLOBAL_accountname = tmp_accountname;
                    GLOBAL_password = tmp_password;

                    let fileNames = res.fileNames;
                    let fileIDs = res.fileIDs;

                    //create html for online files

                    for (let file in fileNames)
                    {
                        addOnlineFilesHTML(fileNames[file],fileIDs[file]);
                    }
                }
                else
                {
                    alert(res.error);
                }

            }
        };

        xhttp.open("POST", "php/loginRegister.php", true);

        xhttp.send(fd);
    });

    //upload file
    $("#modifyUploadFile").on("change", function () {

        //if(document.getElementById("modifyUploadFile").files.length !== 0)
        if($('#modifyUploadFile').get(0).files.length !== 0)
        {
            let fd = new FormData();

            let file = $("#modifyUploadFile").prop('files')[0];
            fd.append("accountname", GLOBAL_accountname);
            fd.append("password", GLOBAL_password);
            fd.append("file", file);

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {

                    let res = JSON.parse(this.response);

                    if(res.uploaded == "yes")
                    {
                        addOnlineFilesHTML(res.newFileName, res.fileID);
                    }

                    if(res.error != "")
                    {
                        alert(res.error);
                    }
                    //reset input file to be able to detect new file
                    $("#modifyUploadFile").val("");

                }
            };

            xhttp.open("POST", "php/upload.php", true);

            xhttp.send(fd);
        }

    });

    //anitime we change tab fix dispaly
    //comented because it should be done otherway
    //TODO do other way
    /*$("a").on("click", function(){
        //at the same time that it fixes visible display it also corrupts invisible one
        setTimeout(
            function()
            {
                fixDisplays();
            }, 160);//this number might be to fast fo some comps so we do it again just fo sure

        setTimeout(
            function()
            {
                fixDisplays();
            }, 200);

        setTimeout(
            function()
            {
                fixDisplays();
            }, 500);

    });*/

    //set text labels for file input
    $("#inputF1").on("change" , displayFile1Name);
    $("#inputF2").on("change" , displayFile2Name);
    //also hide extra parametrs
    $("#generateInputF1").on("change" , function () {
        displayFileName("generateInputF1", "generateInputF1text");
    });
    $("#generateInputF2").on("change" , function () {
        displayFileName("generateInputF2", "generateInputF2text");
    });
    $("#generateInputF3").on("change" , function () {
        displayFileName("generateInputF3", "generateInputF3text");
    });
    $("#generateInputF4").on("change" , function () {
        displayFileName("generateInputF4", "generateInputF4text");
    });

    $("#generateParametrsExtra").on("input", function()
    {
        hideGenerateFiles();
    });


    //on basicly any change reset progres bars
    $("#modifyInput").on("change", function () {
        $("#modifyProgresUpload").width(0);
        $("#modifyProgresProcess").width(0);
    });
    $("#modifySelectFilters").on("change", function () {
        $("#modifyProgresUpload").width(0);
        $("#modifyProgresProcess").width(0);
    });
    $("#generateInput").on("change", function () {
        $("#generateProgresUpload").width(0);
        $("#generateProgresProcess").width(0);
    });
    $("#generateSelectFilters").on("change", function () {
        $("#generateProgresUpload").width(0);
        $("#generateProgresProcess").width(0);
    });

    $("#modifySelectFiltersCheckBoxes input").on("change", changeColor);

    //RESET MODIFY
    $("#modifyReset").on("click", modifyReset);

    //RESET GENERATE
    $("#generateReset").on("click", generateReset);

    //display curent selection of filters
    $("#modifyArguments").on("click", function(){
        let parameters = getModifyParametrs();
        let R = "";


        if(document.getElementById("inputF1").files.length !== 0)
        {
            R += "-i ./" + document.getElementById("inputF1").files[0].name;
        }
        R += parameters.Cli;
        if(parameters.outS != "")
        {
            R += " -s"
            if(parameters.outS != "s")
            {
                R += " ./" + parameters.outS;
            }
        }

        let aa = parameters.out;
        if(aa != "")
        {
            R += " -o"
            if(aa != "txt" && aa != "s2" && aa != "csv")
            {
                R += " ./" + aa;
            }
            else
            {
                R += " " + aa;
            }
        }

        document.getElementById("modifyDisplayC").innerText = "Cli commands : " + R;

    })


    //manualy submit form with ajax
    $("#modifyRun").on("click",function () {

        let parameters = getModifyParametrs();
        if (parameters.ready)
        {
            let fd = new FormData();

            if (GLOBAL_fileType == "")
            {
                window.alert("We need input file.");
                return;
            }
            else if(GLOBAL_fileType == "local")
            {
                let file_data1 = $("#inputF1").prop('files')[0];
                fd.append("file1", file_data1);
                fd.append("file1Type", GLOBAL_fileType);
            }
            else
            {
                fd.append("file1Online",GLOBAL_fileName);
                fd.append("file1Type", GLOBAL_fileType);
                fd.append("accountname", GLOBAL_accountname);
                fd.append("password", GLOBAL_password);
            }

            if (parameters.task == "merge" && $("#inputF2").val() != '')
            {
                let file_data2 = $("#inputF2").prop('files')[0];
                fd.append("file2", file_data2);
            }
            else if (parameters.task == "merge")
            {
                window.alert("We also need secondary file.");
                return;
            }

            fd.append("Cli", parameters.Cli);
            fd.append("out", parameters.out);
            fd.append("outS", parameters.outS);
            fd.append("task", parameters.task);

            //display arguments for cli
            $("#modifyArguments").click();

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    $("#modifyProgresProcess").width(100 + '%');
                    //document.getElementById("modifyDisplayP").innerHTML = this.responseText;

                    let res = JSON.parse(this.response);

                    if(res.out != null)
                    {
                        let a = document.createElement("a");
                        a.href = res.out;
                        a.download = res.outn;
                        a.click();
                    }

                    if(res.outS != null)
                    {
                        let a = document.createElement("a");
                        a.href = res.outS;
                        a.download = res.outSn;
                        a.click();
                    }

                    let display = document.getElementById("modifyDisplayP");
                    display.innerText = res.display;
                    fixDisplayUnder();
                }
            };

            xhttp.open("POST", "php/parsingRunning.php", true);

            xhttp.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    let percentComplete = (e.loaded / e.total) * 100;
                    $("#modifyProgresUpload").width(percentComplete + '%');
                }
            };

            xhttp.send(fd);
        }
        else
        {
            //parameters arent ready
        }
    })

    $("#generateRun").on("click",function () {

        let parameters = getGenerateParametrs();
        if (parameters.ready)
        {
            let fd = new FormData();

            if(parameters.task == "g2")
            {
                fd.append("task", "g2");
            }
            else if(parameters.task == "g3")
            {
                let file_data1 = $("#generateInputF1").prop('files')[0];
                let file_data2 = $("#generateInputF2").prop('files')[0];
                let file_data3 = $("#generateInputF3").prop('files')[0];
                let file_data4 = $("#generateInputF4").prop('files')[0];

                fd.append("file1", file_data1);
                fd.append("file2", file_data2);
                fd.append("file3", file_data3);
                fd.append("file4", file_data4);

                fd.append("task", "g3");
            }
            else
            {
                //PROBLEM ALERT?
            }

            fd.append("Cli", parameters.Cli);
            fd.append("out", parameters.out);


            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    $("#generateProgresProcess").width(100 + '%');

                    let res = JSON.parse(this.response);

                    if(res.out != null)
                    {
                        let a = document.createElement("a");
                        a.href = res.out;
                        a.download = res.outn;
                        a.click();
                    }

                    if(res.outS != null)
                    {
                        let a = document.createElement("a");
                        a.href = res.outS;
                        a.download = res.outSn;
                        a.click();
                    }

                    let display = document.getElementById("generateDisplayP");
                    display.innerText = res.display;
                    fixDisplayUnder();
                }
            };


            xhttp.open("POST", "php/parsingRunning.php", true);

            xhttp.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    let percentComplete = (e.loaded / e.total) * 100;
                    $("generateProgresUpload").width(percentComplete + '%');
                }
            };

            xhttp.send(fd);
        }
        else
        {
            //parameters arent ready
        }
    })
}

//-------------      ON READY END    -------------------------

//-------------      WINDOW RESIZE     -------------------------
$(window).resize(function () {
    fixDisplays();
});


//-------------      WINDOW RESIZE  END   -------------------------

//-------------      HTML functions     -------------------------


function fixDisplays()
{
    //$("#modifyDisplayUnder").width('100%');
    let x = $("#modifyDisplayUnder").width();
    $("#modifyDisplay").width(x);

    let y = $("#generateDisplayUnder").width();
    $("#generateDisplay").width(y);

    fixDisplayUnder()
}

function fixDisplayUnder() {
    let x = $("#modifyDisplay").height();
    $("#modifyDisplayUnder").height(x);

    let y = $("#generateDisplay").height();
    $("#generateDisplayUnder").height(y);

}

function changeColor() {
    if(this.checked)
    {
        this.parentNode.classList.add("btn-primary-selected");
    }
    else
    {
        this.parentNode.classList.remove("btn-primary-selected");
    }
}

function displayFile1Name()
{
    if(document.getElementById("inputF1").files.length !== 0)
    {
        document.getElementById("inputF1text").innerHTML = "Local file : " + document.getElementById("inputF1").files[0].name;
        GLOBAL_fileType = "local";
        GLOBAL_fileName = document.getElementById("inputF1").files[0].name;
        document.getElementById("inputF1").parentNode.classList.add("btn-primary-selected");
    }
    else
    {
        document.getElementById("inputF1text").innerHTML = "None";
        GLOBAL_fileType = "";
        GLOBAL_fileName = "";
        document.getElementById("inputF1").parentNode.classList.remove("btn-primary-selected");
    }
}
function displayFile2Name()
{
    if(document.getElementById("inputF2").files.length !== 0)
    {
        document.getElementById("inputF2text").innerHTML = "Local file : " + document.getElementById("inputF2").files[0].name;
        document.getElementById("inputF2").parentNode.classList.add("btn-primary-selected");
    }
    else
    {
        document.getElementById("inputF2text").innerHTML = "Select the file you want to modify.";
        document.getElementById("inputF2").parentNode.classList.remove("btn-primary-selected");
    }
}

//for generate
function displayFileName(fileInput, fileText)
{
    if(document.getElementById(fileInput).files.length !== 0)
    {
        document.getElementById(fileText).innerHTML = document.getElementById(fileInput).files[0].name;
        document.getElementById("generateParametrsExtra").style.display = "none"; //we have files dont want extra parametrs

        document.getElementById(fileInput).parentNode.classList.add("btn-primary-selected");
    }
    else
    {
        document.getElementById(fileText).innerHTML = "Select the file you want to modify.";
        document.getElementById(fileInput).parentNode.classList.remove("btn-primary-selected");
    }
}

function hideGenerateFiles()
{

    //in case we have extra parametrs we dont need files
    document.getElementById("generateInput").style.display = "none";

}

function modifyReset()
{
    $("#modifyFilters div").collapse("hide");//hides open filters

    document.getElementById("modifyForm").reset();
}

function generateReset()
{
    document.getElementById("generateParametrsExtra").style.display = "block";
    document.getElementById("generateInput").style.display = "block";
    document.getElementById("generateForm").reset();
}

//-------------      HTML functions END    -------------------------


function getModifyParametrs()
{
    let result = {Cli:"",out:"",outS:"", task: "modify", ready:false};

    let filter = document.getElementById("filterMergeCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterMergeCB1");
        result.Cli += " -m " + atribute.checked;
        result.task = "merge";
    }

    filter = document.getElementById("filterDataCB");
    if(filter.checked)
    {
        let data = "";

        let elementsIDs = ["filterDataCB5","filterDataCB4","filterDataCB3","filterDataCB2", "filterDataCB1"];
        let atribute = null;

        for (let i = 0; i < elementsIDs.length; i++) {
            atribute = document.getElementById(elementsIDs[i]);
            let tmp1 = atribute.checked;
            let tmp2 = Number(tmp1);
            data += 1-tmp2;
        }

        result.Cli += " -fd " + data;
    }

    filter = document.getElementById("filterNumberLinesCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterNumberLinesN1");
        let v = Number(atribute.value);
        if(v >= 0 && Number.isInteger(v))
        {
            result.Cli += " -fnl " + v;
        }
        else
        {
            window.alert("Filter number of lines : number must be positive integer.");
            return result;
        }
    }

    filter = document.getElementById("filterCommentsCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterCommentsT1");
        result.Cli += " -fc " + atribute.value;
    }

    filter = document.getElementById("filterSpecialCB");
    if(filter.checked)
    {
        result.Cli += " -fs";
        let atribute = document.getElementById("filterSpecialWho");
        result.Cli += " " + atribute.value;
        atribute = document.getElementById("filterSpecialWhat");
        result.Cli += " " + atribute.value;
        atribute = document.getElementById("filterSpecialT1");
        result.Cli += " " + atribute.value;
    }

    filter = document.getElementById("filterHandlesCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterHandlesT1");
        result.Cli += " -fh " + atribute.value;
    }

    filter = document.getElementById("filterTimeCB");
    if(filter.checked)
    {
        let atribute1 = document.getElementById("filterTimeN1");
        let atribute2 = document.getElementById("filterTimeN2");
        if(atribute1.value > atribute2.value)
        {
            window.alert("Filter time : end must be bigger than start.")
        }

        let atribute = document.getElementById("filterTimeCB1");

        result.Cli += " -ft " + atribute1.value + " " + atribute2.value + " " + atribute.checked;
    }

    filter = document.getElementById("filterChangeHandleCB");
    if(filter.checked)
    {
        let atribute1 = document.getElementById("filterChangeHandleN1");
        let atribute2 = document.getElementById("filterChangeHandleN2");
        result.Cli += " -ch " + atribute1.value + " " + atribute2.value;
    }

    filter = document.getElementById("filterChangeTimeCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterChangeTimeN1");
        if(Number.isInteger(atribute.value))
        {
            result.Cli += " -ct " + atribute.value;
        }
        else
        {
            window.alert("Filter change time : Number must be integer.")
        }

    }

    filter = document.getElementById("filterChangeDateCB");
    if(filter.checked)
    {
        let atribute1 = document.getElementById("filterChangeDateDate");
        let atribute2 = document.getElementById("filterChangeDateHr");
        let atribute3 = document.getElementById("filterChangeDateMin");
        let atribute4 = document.getElementById("filterChangeDateS");


        result.Cli += " -cdt " + atribute1.value +"T"+ atribute2.value +":"+ atribute3.value +":"+ parseFloat(atribute4.value).toFixed(3)+"+0000";
    }

    filter = document.getElementById("filterProcessSignalCB");
    if(filter.checked)
    {
        result.Cli += " -p";
    }

    filter = document.getElementById("filterStatisticsCB");
    if(filter.checked)
    {
        let atribute = document.getElementById("filterStatistikaT1");

        result.outS += "s";

        if(atribute.value.length > 0)
        {
            result.outS = atribute.value + ".txt";
        }
    }

    filter = document.getElementById("filterOutputCB");
    if(filter.checked)
    {
        let atribute1 = document.getElementById("filterOutputT1");
        let atribute2 = document.getElementById("filterOutputExtension");

        if(atribute1.value.length > 0)
        {
            result.out +=  atribute1.value + ".";
        }
        result.out += atribute2.value;

    }

    result.ready = true;

    return result;

}


function getGenerateParametrs()
{
    let result = {Cli:"",out:"", task:0,ready:false};

    let start = document.getElementById("generateFilterTimeN1");
    let end = document.getElementById("generateFilterTimeN2");
    let out = document.getElementById("generateFilterOutput");

    if(start.value != '' && end.value != '' && out.value != '')
    {
        result.Cli = " -ft " + start.value + " " + end.value;
        result.out = out.value+".s2";

        if (($("#generateInputF1").val() != '') && ($("#generateInputF2").val() != '') && ($("#generateInputF3").val() != '') && ($("#generateInputF4").val() != ''))
        {
            result.Cli += " -g3";
            result.ready = true;
            result.task = "g3";
        }
        else
        {
            let p0 = $("#generateFilterSeedN1").val();
            let p1 = $("#generateFilterFrequencyN1").val();
            let p2 = $("#generateFilterFrequencyChangeN1").val();
            let p3 = $("#generateFilterMissingN1").val();
            let p4 = $("#generateFilterDelayN1").val();
            let p5 = $("#generateFilterBigDelayChanceN1").val();
            let p6 = $("#generateFilterMaxBigDelayN1").val();
            let p7 = $("#generateFilterDisconectsN1").val();
            let p8 = $("#generateFilterStuckBitIndexN1").val();
            let p9 = $("#generateFilterStuckBitValueN1").val();

            result.Cli += " -g2 " + p0 + " " + p1 + " " + p2 + " " + p3 + " " + p4 + " " + p5 + " " + p6 + " " + p7 + " " + p8 + " " + p9;
            result.ready = true;
            result.task = "g2";
        }
    }

    return result;

}


//-------------      AJAX REQUESTS      -------------
function deleteFile(fileName, elementID)
{
    let fd = new FormData();
    fd.append("accountname", GLOBAL_accountname);
    fd.append("password", GLOBAL_password);
    fd.append("fileName", fileName);

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {

            let res = JSON.parse(this.response);

            if(res.deleted == "yes")
            {
                $(elementID).remove();
            }
            if(res.error != "")
            {
                alert(res.error);
            }

        }
    };

    xhttp.open("POST", "php/delete.php", true);

    xhttp.send(fd);
}

function addOnlineFilesHTML(fileName, fileID)
{
    let template1 = '<a id="onlineFile';
    let template2 = '" href="#" class="list-group-item list-group-item-action flex-column align-items-start list-group-item-onlineFiles">\n' +
        '                                    <span id="onlineFileName'
    let template3 = '">';
    let template4 = '</span>\n' +
        '                                    <img id="onlineFileDelete';
    let template5 = '" src="files/remove.png" class="float-right" style="max-height: 15px">\n' +
        '                                </a>';


    //create html for online file

    let tmp_s = "-" + String(fileID);
    let tmp_template = template1 + tmp_s + template2 + tmp_s + template3 +fileName+ template4 +  tmp_s + template5;

    $("#onlineFiles").append(tmp_template);
    $("#onlineFileDelete" + tmp_s).on("click", function () {
        let tmp_fileName = $("#onlineFileName" + tmp_s).text();
        deleteFile(tmp_fileName, "#onlineFile" + tmp_s);
    })
    
    $("#onlineFileName" + tmp_s).on("click", function () {
        $("#inputF1text").text("Online file : " + this.innerText);
        GLOBAL_fileType = "online"
        GLOBAL_fileName = this.innerText;
        $("#inputF1").val("");
    })
}