<?php

$endl = "\n\r";

//SAVING ALL

	$s = fopen('save.log', 'w');
	fwrite($s, "Session OPENED:$endl");

	$post = file_get_contents('php://input');

	fwrite($s, "Got Data: $post$endl");

	$json = json_decode($post, true);

	if(!isset($json['data'])){
		$json['data'] = "<html>\n<head></head><body>File wounded!</body>\n</html>";
	}

	if(!isset($json['path'])){
		fwrite($s, "Path not specified! $endl");
		$json['path'] = "dump.txt";
	}
	fwrite($s, "File path set to: ".$json['path']."$endl");

	$file = fopen($json['path'], "w");
	fwrite($file, $json['data']);
	fclose($file);

	fwrite($s, "Data saved: ".$json['data']."$endl");

	fwrite($s, "Data successfully saved!$endl");

	fclose($s);

?>