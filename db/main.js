let sort = (asc, sort) => {
    const src = `${asc}=${sort}`;
    const wls = window.location.search;
    if (/(asc|desc)=/.exec(wls)) {
        window.location.search = wls.replace(/(asc|desc)=.*?(?=&|$)/, `${src}`);
    } else {
        window.location.search += `${wls.includes("?")?"&":"?"}${src}`;
    }
}

let updateStatus = (statEl) => {
    const prevStat = statEl.innerText
    const gameID = statEl.parentNode.getAttribute("gameid");
    let newStat;
    while (!newStat || !/^\d$/.test(newStat)) {
        newStat = prompt(`New Status (${prevStat}):`);
        if (newStat === null)
            return;
    }
    document.forms[0].querySelector("input").value = `${gameID},${newStat}`;
    document.forms[0].submit();
}