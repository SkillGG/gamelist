<?php

$games = [];

// db connection
$conn = new mysqli("localhost", "gamelist", "", "games");

if ($conn->connect_error)
    die("Couldn't connect to the database!");

if (isset($_POST['updateStatus'])) {
    $uS = $_POST['updateStatus'];
    preg_match("/(?<id>\d+),(?<status>\d)/", $uS, $m);
    if ($m["id"] && $m["status"]) {
        if ($updatePrep = $conn->prepare("update games set status=? where id=?")) {
            $updatePrep->bind_param("ii", intval($m['status']), intval($m['id']));
            if (!$updatePrep->execute()) {
                die("Error: " . $updatePrep->error);
            }
        }
    }
}

$filter = array(
    "limit" => 5000,
    "regx" => null,
    "like" => null,
    "position" => null,
    "order" => null,
    "asc" => true
);

function none(string $s) {
    return $s;
};

/**
 * @param string $regx Regular Expression
 * @param string $filnam Filter Name
 * @param string $fstr Filtered String
 * @param callable $callback Callback to do before each function 
 * @param bool $foreach Is multiplication of filters possible
 * @param bool $isAndConcat Which filter type is used
 */
function addFilter(string $regx, string $filnam, string $fstr, callable $callback, bool $foreach = false, bool $isAndConcat = false) {
    global $filter;
    if (!$foreach) {
        preg_match($regx, $fstr, $m);
        if (count($m) > 0) {
            $filter[$filnam] = $callback($m[$filnam]);
        }
    } else {
        preg_match_all($regx, $fstr, $m, PREG_SET_ORDER);
        if (count($m) > 1) {
            $filter[$filnam] = [$isAndConcat];
            foreach ($m as $match) {
                $filter[$filnam][] = $callback($match[$filnam]);
            }
        } else if (count($m) > 0) {
            addFilter($regx, $filnam, $fstr, $callback, false);
        }
    }
}

function filterRegEx(string $name, string $insides, string $secname = null) {
    if ($secname === null) $secname = $name;
    return "/$name\\(\\s*(?<" . $secname . ">$insides)\\s*\\)/";
}

function getPosition(string $s) {
    preg_match_all("/(\d+)/", $s, $m, PREG_SET_ORDER);
    return [intval($m[0][0]), intval($m[1][0])];
}

function getPositionFilter($a) {
    if (is_array($a[1])) {
        $isAnd = $a[0] ? "and" : "or";
        return str_replace(
            "_",
            "",
            preg_replace(
                "/_(?!$)/",
                $isAnd,
                array_reduce(
                    array_slice($a, 1),
                    function ($a, $b) {
                        return $a . "(id between $b[0] and $b[1])_";
                    },
                    ""
                )
            )
        );
    } else {
        return "id between $a[0] and $a[1]";
    }
}

function getIntFilter($i) {
    if ($i) {
        $id = intval($i);
        return "$id";
    }
    return "";
}

function getStrFilter($r) {
    if (empty($r))
        return null;
    else
        return $r;
}

if (isset($_GET['filters'])) {
    $filterstr = $_GET['filters'];
    addFilter(filterRegEx("limit", "\\d+"), "limit", $filterstr, 'intval');
    addFilter(filterRegEx("l", "\\d+", "limit"), "limit", $filterstr, 'intval');
    addFilter(filterRegEx("id", "\\d+"), "id", $filterstr, 'intval');
    addFilter(filterRegEx("i", "\\d+", "id"), "id", $filterstr, 'intval');
    addFilter(filterRegEx("pos", "\\d+\\s*,\\s*\\d*", "position"), "position", $filterstr, 'getPosition', true, true);
    addFilter(filterRegEx("position", "\\d+\\s*,\\s*\\d*"), "position", $filterstr, 'getPosition', true, true);
    addFilter(filterRegEx("between", "\\d+\\s*,\\s*\\d*", "position"), "position", $filterstr, 'getPosition', true, true);
    addFilter(filterRegEx("id", "\\d+\\s*,\\s*\\d*", "position"), "position", $filterstr, 'getPosition', true, true);
    addFilter(filterRegEx("i", "\\d+\\s*,\\s*\\d*", "position"), "position", $filterstr, 'getPosition', true, true);
    addfilter(filterRegEx("regex", "\\/.*?\\/i?", "regx"), "regx", $filterstr, 'none');
    addFilter(filterRegEx("regx", "\\/.*?\\/i?", "regx"), "regx", $filterstr, 'none');
    addFilter(filterRegEx("r", "\\/.*?\\/i?", "regx"), "regx", $filterstr, 'none');
    addFilter(filterRegEx("like", "[^\\r\\n\\t']*?"), "like", $filterstr, 'none');
    addFilter(filterRegEx("status", "\d"), "status", $filterstr, 'intval');
}

if (isset($_GET['asc'])) {
    $filter["asc"] = true;
    $filter['order'] = $_GET['asc'];
}

if (isset($_GET['desc'])) {
    $filter["asc"] = false;
    $filter['order'] = $_GET['desc'];
}

function getGamePrepare($filter) {
    $whereFilter = "";
    $orderBy = "";
    $idFilter = null;
    $posFilter = null;
    $likeFilter = null;
    $statFilter = null;
    if (isset($filter['id']))
        $idFilter = "id=" . getIntFilter($filter["id"]);
    if (isset($filter['position']))
        $posFilter = getPositionFilter($filter["position"]);
    if (isset($filter['like']))
        $likeFilter = "name like '" . getStrFilter($filter['like']) . "'";
    if (isset($filter['status']))
        $statFilter = "status = " . getIntFilter($filter["status"]);

    if ($idFilter)
        $whereFilter = "($idFilter)";
    else if ($posFilter)
        $whereFilter = "($posFilter)";
    if ($likeFilter && empty($whereFilter))
        $whereFilter = "($likeFilter)";
    else if ($likeFilter)
        $whereFilter .= " and ($likeFilter)";
    if ($statFilter && empty($whereFilter))
        $whereFilter = "($statFilter)";
    else if ($statFilter)
        $whereFilter .= " and ($statFilter)";

    if (isset($filter['order']))
        $orderBy = "order by " . $filter['order'] . " " . ($filter["asc"] ? "asc" : "desc");

    if (!empty($whereFilter)) {
        $whereFilter = "where $whereFilter";
        $orderBy = " $orderBy";
    }
    return "select id, name, status from games $whereFilter$orderBy limit ?;";
}

if ($selectgames = $conn->prepare(getGamePrepare($filter))) {
    $selectgames->bind_param("i", $filter["limit"]);
    $selectgames->bind_result($id, $name, $status);
    $selectgames->execute();
    $rxFilter = getStrFilter($filter["regx"]);
    while ($selectgames->fetch()) {
        if (!$rxFilter)
            $games[] = [$id, $name, $status];
        else {
            preg_match($rxFilter, $name, $m);
            if (count($m) > 0)
                $games[] = [$id, $name, $status];
        }
    }
}

if ($gamegenres = $conn->prepare(
    <<<END
select genres.name, genres.id from
genres
left join
game_genres
on genres.id=game_genres.genre_id
left join
games
on
games.id=game_genres.game_id
where games.id=?;
END
)) {
    $gamegenres->bind_param("i", $gameid);
    $gamegenres->bind_result($genre, $sgn);
    foreach ($games as $key => $value) {
        $games[$key][] = [];
        $genres = [];
        $gameid = $value[0];
        $gamegenres->execute();
        while ($gamegenres->fetch())
            $games[$key][array_key_last($games[$key])][] = strlen($genre) < 10 ? $genre : $sgn;
    }
}

function isOrder($filter, $or, $as, $ds, $r = true) {
    return $filter["order"] !== $or ? ($r ? $as : $ds) : ($filter["asc"] ? $ds : $as);
}

$idTitle = isOrder($filter, "id", "Ascending", "Descending");
$nameTitle = isOrder($filter, "name", "Ascending", "Descending");
$statusTitle = isOrder($filter, "status", "Ascending", "Descending");
$idSort = isOrder($filter, "id", "asc", "desc");
$nameSort = isOrder($filter, "name", "asc", "desc");
$statusSort = isOrder($filter, "status", "asc", "desc");

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game List</title>
    <link rel="stylesheet" href="tables.css?r<?php echo rand(); ?>">
    <script src="main.js" defer></script>
</head>

<body>

    <div id='menu'>
        <div id='content'>
            <div>Found: <?php echo count($games); ?></div>
            <div></div>
            <div></div>
        </div>
    </div>

    <form style='display:none' method="POST" action="#">
        <input name="updateStatus" value="">
        <input type="submit">
    </form>

    <table id='maintable'>
        <thead>
            <th><a title='Sort <?php echo $idTitle; ?>' onclick='sort("<?php echo $idSort; ?>","id")'>No. <i><?php if ($filter['order'] === "id") echo $filter["asc"] ? "ASC" : "DESC"; ?></i></a></th>
            <th><a title='Sort <?php echo $nameTitle; ?>' onclick='sort("<?php echo $nameSort; ?>","name")'>Game<br><i><?php if ($filter['order'] === "name") echo $filter["asc"] ? "ASC" : "DESC"; ?></i></a></th>
            <th><a title='Sort <?php echo $statusTitle; ?>' onclick='sort("<?php echo $statusSort; ?>","status")'>Status <i><?php if ($filter['order'] === "status") echo $filter["asc"] ? "ASC" : "DESC"; ?></i></a></th>
        </thead>
        <tbody>
            <?php
            foreach ($games as $game) {
                $genres = "";
                foreach ($game[array_key_last($game)] as $genre) {
                    $genre = str_replace(" ", "&nbsp;", $genre);
                    $genres .= "<li>$genre&nbsp;<span onclick='remove(this)'>[-]</span></li>";
                }
                echo <<<END
            <tr gameID=$game[0]>
                <td>$game[0]</td>
                <td class='gamecolumn'>
                    <div class="gameinfo">
                        <div>
                            <div class='nametag'>$game[1]</div>
                        </div>
                        <ul class='genlist'>
                            $genres
                            <li><span onclick="add(this)">[+]</span></li>
                        </ul>
                    </div>
                </td>
                <td onclick="updateStatus(this)">$game[2]</td>
            </tr>
END;
            }

            ?>
        </tbody>
    </table>
</body>

</html>