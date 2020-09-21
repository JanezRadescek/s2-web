<?php
/**
 * Created by PhpStorm.
 * User: janez
 * Date: 5. 11. 2018
 * Time: 15:55
 */

$returnJSON = array();
$returnJSON["display"] = "";
$javaCMD = "java -cp java/commons-cli-1.4.jar".PATH_SEPARATOR."java/submodules/s2-java-lib/bin".PATH_SEPARATOR."java/submodules/pcardtimesync/bin".PATH_SEPARATOR."java/bin cli.Cli";

$servername = "localhost";
$username = "read";
$password = "daer";
$dbname = "myDB";

$username = "s2_webpage";
$password = "Nattuzai1";
$dbname = $username;


if ($_SERVER["REQUEST_METHOD"] == "POST") {

    chdir("..");
    $wdir = getcwd();
    $dir = "./tmp/";

    if($_POST["task"] === 'g2')
    {
        $formString = $_POST["Cli"]." -o ".$dir.$_POST["out"];

        $javaOut = array();
        $javaReturn = 1;

        $cliArguments = $formString;
        $command = $javaCMD.$cliArguments." 2>&1";

        exec($command, $javaOut, $javaReturn);

        if($javaReturn == 0)
        {
            $returnJSON["display"] .= implode(PHP_EOL, $javaOut).PHP_EOL;
            appendFileToJSON(dir . $_POST["out"], $_POST["out"],"out",$returnJSON);
        }
        else
        {
            $returnJSON["display"] .= "Java returned exit code ".$javaReturn." ".PHP_EOL.
                "Java error message ".implode(PHP_EOL, $javaOut).PHP_EOL;
        }

    }
    elseif ($_POST["task"] === 'g3')
    {
        if(file_exists($_FILES["file1"]["tmp_name"]) > 0 &&
            file_exists($_FILES["file2"]["tmp_name"]) > 0 &&
            file_exists($_FILES["file3"]["tmp_name"]) > 0 &&
            file_exists($_FILES["file4"]["tmp_name"]) > 0)
        {
            //prep input files
            $tmp_name = $_FILES["file1"]["tmp_name"];
            $name = basename($_FILES["file1"]["name"]);
            $destination = $dir.$name;
            $result = move_uploaded_file ($tmp_name, $destination);
            $g3input = " ".$destination;

            $tmp_name = $_FILES["file2"]["tmp_name"];
            $name = basename($_FILES["file2"]["name"]);
            $destination = $dir.$name;
            $result = move_uploaded_file ($tmp_name, $destination);
            $g3input .= " ".$destination;

            $tmp_name = $_FILES["file3"]["tmp_name"];
            $name = basename($_FILES["file3"]["name"]);
            $destination = $dir.$name;
            $result = move_uploaded_file ($tmp_name, $destination);
            $g3input .= " ".$destination;

            $tmp_name = $_FILES["file4"]["tmp_name"];
            $name = basename($_FILES["file4"]["name"]);
            $destination = $dir.$name;
            $result = move_uploaded_file ($tmp_name, $destination);
            $g3input .= " ".$destination;


            $cliArguments = $_POST["Cli"].$g3input." -o ".$dir.$_POST["out"];

            $command = $javaCMD.$cliArguments." 2>&1";

            exec($command, $javaOut, $javaReturn);

            if($javaReturn == 0)
            {
                $returnJSON["display"] .= implode(PHP_EOL, $javaOut).PHP_EOL;
                appendFileToJSON($dir . $_POST["out"], $_POST["out"],"out",$returnJSON);
            }
            else
            {
                $returnJSON["display"] .= "Java returned exit code ".$javaReturn." ".PHP_EOL.
                    "Java error message ".implode(PHP_EOL, $javaOut).PHP_EOL;
            }
        }
        else
        {
            $returnJSON["display"] .= "Server didnt get 4 input files.".PHP_EOL;
        }

    }
    elseif ($_POST["task"] === 'modify' || $_POST["task"] === 'merge')
    {
        $inputString = "";
        $filePreparationOK = true;
        if($_POST["file1Type"] == "local")
        {
            if(filesize($_FILES["file1"]["tmp_name"]) > 0)
            {
                //prep input files
                $tmp_name = $_FILES["file1"]["tmp_name"];
                $name = basename($_FILES["file1"]["name"]);
                $destination = $dir.$name;
                $filePreparationOK &= move_uploaded_file ($tmp_name, $destination);
                $inputString = " -i ".$destination;

                if($_POST["task"] === 'merge')
                {
                    if(filesize($_FILES["file2"]["tmp_name"]) > 0)
                    {
                        $tmp_name = $_FILES["file2"]["tmp_name"];
                        $name2 = basename($_FILES["file2"]["name"]);
                        if($name === $name2)
                        {
                            //we add '2' because we got 2 files with same name
                            $name2 = "2".$name2;
                        }
                        $destination = $dir.$name2;
                        $filePreparationOK &= move_uploaded_file ($tmp_name, $destination);
                        $inputString .= " ".$destination;
                    }
                    else
                    {
                        $filePreparationOK = false;
                        $returnJSON["display"] .= "Merge needs secondary file.".PHP_EOL;
                    }
                }

            }
            else
            {
                $returnJSON["display"] .= "Server didnt get file.".PHP_EOL;
            }

        }
        else if($_POST["file1Type"] == "online")
        {
            $conn = new mysqli($servername, $username, $password, $dbname);

            //check if we have acces to database
            if($conn->connect_errno != 0)
            {
                //something went wrong;
                $returnJSON["error"] .= "Something is wrong with database";
                $conn->close();
                $json = json_encode($returnJSON);
                die($json);
            }


            //check if correct user and password
            $sql = "SELECT * FROM accounts WHERE accountname = ?";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $accountname);

            $accountname = $_POST["accountname"];
            $result1 = $stmt->execute();
            $result2 = $stmt->get_result();
            $result3 = $result2->fetch_assoc();
            $stmt->close();

            if(password_verify($_POST["password"], $result3["passwordhash"]))
            {
                $inputString = " -i './usersFiles/".$accountname."/".$_POST["file1Online"]."'";
            }
            else
            {
                $returnJSON["error"] .= "Wrong username or password.";
                $filePreparationOK = false;
            }
        }

        if($filePreparationOK)
        {
            //preper output files and build final CLI arguments string
            $nameOut = "";
            $nameOutS = "";
            $formString = $_POST["Cli"];
            $a = $_POST["out"];
            if($a != "")
            {
                $formString .= " -o";
                if($a != 'txt' && $a != 's2' && $a != 'csv')
                {
                    $formString .= " ./tmp/".$a;
                    $nameOut = $a;
                }
                else
                {
                    $formString .= " ".$a;
                }
            }
            $a = $_POST["outS"];
            if($a != "")
            {
                $formString .= " -s";
                if($a != 's')
                {
                    $formString .= " ./tmp/".$a;
                    $nameOutS = $a;
                }
            }

            $javaOut = array();
            $javaReturn = 1;

            $cliArguments = $inputString." ".$formString;
            $command = $javaCMD.$cliArguments." 2>&1";

            exec($command, $javaOut, $javaReturn);

            if($javaReturn == 0)
            {
                $returnJSON["display"] .= implode(PHP_EOL, $javaOut).PHP_EOL;
                if($nameOut != '')
                {
                    appendFileToJSON("./tmp/".$nameOut, $nameOut,"out",$returnJSON);
                }
                if($nameOutS != '')
                {
                    appendFileToJSON("./tmp/".$nameOutS, $nameOutS,"outS",$returnJSON);
                }
            }
            else
            {
                $returnJSON["display"] .= "Java returned exit code ".$javaReturn." ".PHP_EOL.
                    "Java error message ".implode(PHP_EOL, $javaOut).PHP_EOL;
            }
        }
        else
        {
            $returnJSON["display"] .= "Server couldnt prepare files.".PHP_EOL;
        }
    }// END modify
    else
    {
        $returnJSON["display"] .= "Server does not suport this kind of POST request.".PHP_EOL;
    }
}
else
{
    $returnJSON["display"] .= "POST methods only.".PHP_EOL;
}

$json = json_encode($returnJSON);

header("Pragma: public");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Content-Type: application/force-download");
header("Content-Type: application/octet-stream");
header("Content-Type: application/download");
//header("Content-Disposition: attachment;filename='c2.s2'");
header("Content-Transfer-Encoding: binary ");

echo $json;



$files = glob('./tmp/*'); // get all file names
foreach($files as $file) { // iterate files
    if (is_file($file))
        unlink($file); // delete file
}



//     -----------------------------------    GLOBAL FUNCTIONS     -------------------------------------------



function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function appendFileToJSON( $dir, $name, $JSONname, &$returnJSON)
{
    $fileContent = file_get_contents($dir);
    if($fileContent)
    {
        $dataUrl = 'data:' . "file" . ';base64,' . base64_encode($fileContent);
        $returnJSON[$JSONname] = $dataUrl;
        $returnJSON[$JSONname."n"] = $name;
        unlink(dir);
    }
    else
    {
        $returnJSON["display"] .= "File ".$name." couldnt be send, because it doesnt exist.".PHP_EOL;
    }

}



?>