<?php
/**
 * Created by PhpStorm.
 * User: janez
 * Date: 25.3.2019
 * Time: 18:00
 */

$returnJSON = array();
$returnJSON["error"] = "";


$servername = "localhost";
$username = "upload";
$password = "daolpu";
$dbname = "myDB";

$username = "s2_webpage";
$password = "Nattuzai1";
$dbname = $username;


$conn = new mysqli($servername, $username, $password, $dbname);
//check if we have acces to database
if($conn->connect_errno != 0)
{
    //something went wrong;
    $returnJSON["error"] .= "Something is wrong with database".PHP_EOL;
    $conn->close();
    $json = json_encode($returnJSON);
    die($json);
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    //check if correct user and password
    $sql = "SELECT * FROM accounts WHERE accountname = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $accountname);

    $accountname = $_POST["accountname"];
    $result1 = $stmt->execute();
    $result2 = $stmt->get_result();
    $result3 = $result2->fetch_assoc();
    $stmt->close();
    $userID = $result3["userID"];

    if(password_verify($_POST["password"], $result3["passwordhash"]))
    {
        //insert into database
        $file_name = basename($_FILES["file"]["name"]);
        $sql = "INSERT INTO userFiles (fileName, userID) VALUES (?,?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $file_name,$userID);
        $result1 = $stmt->execute();
        $result2 = $stmt->get_result();

        $stmt->close();

        if ($result1)
        {
            $sql = "SELECT fileID from userFiles where fileName = ? and userID = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("si", $file_name,$userID);
            $result1 = $stmt->execute();
            $result2 = $stmt->get_result();
            $result3 = $result2->fetch_assoc();
            $fileID = $result3["fileID"];
            $stmt->close();

            chdir("..");
            $createdDir = true;
            //make dir if it doesnt exist
            if(!file_exists("./usersFiles/".$accountname))
            {
                $createdDir = mkdir("./usersFiles/".$accountname, 0777, true);
            }

            if($createdDir)
            {
                $wdir = getcwd();
                $dir = "./usersFiles/".$accountname."/";

                if($_FILES["file"]["error"] == 0)
                {
                    $tmp_name = $_FILES["file"]["tmp_name"];
                    $destination = $dir.$file_name;
                    $result = move_uploaded_file ($tmp_name, $destination);

                    if ($result)
                    {
                        $returnJSON["uploaded"] = "yes";
                        $returnJSON["newFileName"] = $file_name;
                        $returnJSON["fileID"] = $fileID;
                    }
                    else
                    {
                        deleteFromDataBase($conn,$file_name,$userID);
                        $returnJSON["error"] .= "We couldnt move file on server.".PHP_EOL;
                    }
                }
                else
                {
                    switch ($_FILES["file"]["error"])
                    {
                        case 1:
                            {

                            }
                        case 2:
                            {
                                $returnJSON["error"] .= "The uploaded file exceeds the upload_max_filesize directive.".PHP_EOL;

                                $returnJSON["error"] .= "ini post_max_size = ".ini_get("post_max_size").PHP_EOL;
                                $returnJSON["error"] .= "ini upload_max_filesize = ".ini_get("upload_max_filesize").PHP_EOL;
                                break;
                            }
                        default:
                            {
                                $returnJSON["error"] .= "We couldnt upload file. PHP upload error 3-8.".PHP_EOL;
                            }
                    }
                    deleteFromDataBase($conn,$file_name,$userID);
                }
            }
            else
            {
                deleteFromDataBase($conn,$file_name,$userID);
                $returnJSON["error"] .="We dont have permision to save file.".PHP_EOL;
            }



        }
        else
        {
            $returnJSON["error"] .= "File with same name already exist.".PHP_EOL;
        }
    }


}
else
{
    $returnJSON["error"] .= "POST methods only.".PHP_EOL;
}



function deleteFromDataBase($conn, $file_name, $userID) {
    $sql = "delete from userFiles where fileName = ? AND userID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $file_name,$userID);
    $result1 = $stmt->execute();

    if (!$result1)
    {
        //TODO something whent teribly wrong;
    }

    $stmt->close();
    return;
}


$conn->close();
$json = json_encode($returnJSON);
echo $json;







?>