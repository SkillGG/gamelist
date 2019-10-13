<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Game List</title>
	<link rel="stylesheet" href="index.css">
	<script src="index.js"></script>
	<script src="defer.js" defer></script>
	<script src="http://skilletss.cba.pl/kptat/hide.js" defer></script>
</head>
<body>
	<input id="filters" value="<?php if(isset($_GET['f']))echo $_GET['f'];?>" type="hidden">
	<modal id="filter">
	</modal>
	<div id="statusBar">
		<span id="saveBtn">Save</span>	
		<span id="collectionstatus"></span>
		<span id="filterstatus"></span>
		<span id="filterBtn">Filter</span>
	</div>
	<header id="head">
		<div id="PossibleStates">
			<em>States (<span id='snp'></span>):</em>
			<br>
			0 - Not present (<span id='s0p'></span>)<br>
			1 - Good (<span id='s1p'></span>)<br>
			2 - Wanted / Next (<span id='s2p'></span>)<br>
			3 - No accesory (<span id='s3p'></span>)<br>
			4 - No English (<span id='s4p'></span>)<br>
		</div>
	</header>
	<table id='maintable'>
		<thead>
			<tr>
				<th>No.</th>
				<th>Name</th>
				<th>State</th>
			</tr>
		<thead>
		<tbody id="list">
		</tbody>
	</table>
</body>
</html>
