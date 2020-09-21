<?php

$json = json_encode(
    array(
        "txt"   => "Hello World. This is JSON we just have got from server."
    )
);


header("Pragma: public");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("Content-Type: application/force-download");
header("Content-Type: application/octet-stream");
header("Content-Type: application/download");
//header("Content-Disposition: attachment;filename='tree.jpg'");
header("Content-Transfer-Encoding: binary ");


echo $json;

?>