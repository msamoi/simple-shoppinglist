function getCookie()
{
    let cookies = document.cookie;
    let prefix = "person=";
    let begin = cookies.indexOf("; " + prefix);
    if (begin === -1)
    {
        begin = cookies.indexOf(prefix);
        if (begin !== 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end === -1) end = cookies.length;
    }
    return decodeURI(cookies.substring(begin + prefix.length, end));
}

function escapeSpecial(input) // inspired by top answer in https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
{
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "\"")
        .replace(/'/g, "&#039;");
}

function drawTable()
{
    if (typeof(Storage) !== "undefined")
    {
        let table = document.getElementById("list");
        table.innerHTML = '';
        let thead = table.createTHead();
        let header = thead.insertRow(0);
        let headCount = header.insertCell(0);
        let headItem = header.insertCell(1);
        let headValue = header.insertCell(2);
        headCount.className="count";
        headItem.className="itemcol";
        headValue.className="qtycol";
        headCount.innerHTML="No.";
        headItem.innerHTML="Item";
        headValue.innerHTML="Qty";

        const printlist = JSON.parse(localStorage.getItem(person));
        if (printlist)
        {
           let tbody = table.createTBody();
            const keys = Object.keys(printlist);
            for (let i = 0; i < keys.length; i++)
            {
                let currentItem = keys[i];
                let currentValue = printlist[currentItem];
                let row = tbody.insertRow(-1);
                let countCell = row.insertCell(0);
                let itemCell = row.insertCell(1);
                let valueCell = row.insertCell(2);
                row.className="trow";
                row.onclick = removerow;
                countCell.className="count";
                itemCell.className="itemcol";
                valueCell.className="qtycol";
                countCell.innerHTML = i+1;
                itemCell.innerHTML = currentItem;
                valueCell.innerHTML = currentValue;
            }
        }
    }
}

function removerow()
{
    if (confirm("Do you want to remove this row?"))
    {
        let cell = event.target;
        let row = cell.parentNode;
        let data = cell.innerHTML;
        row.parentNode.removeChild(row);
        let storage = JSON.parse(localStorage.getItem(person));
        delete storage[data];
        storage = JSON.stringify(storage);
        localStorage.setItem(person, storage);
        drawTable();
    }
}

function changename()
{
    document.getElementById("slt").innerHTML =
    person + "'s shopping list";
}

let re = new RegExp("^[A-Za-z0-9 -'&;/()]*$");
let re2 = new RegExp("^[A-Za-z '-]*$");
let personCookie = getCookie();
let person;
const personform = document.getElementById('personform');
if (sessionStorage.getItem("person") !== null)
{
    personform.remove();
    person = sessionStorage.getItem("person");
}
else if (personCookie !== null)
{
    personform.remove();
    person = personCookie;
    sessionStorage.setItem("person", person);
}
else 
{
    person = prompt("Please enter your name", "Avid shopper");
    if (person && re2.test(person))
    {
    personform.remove();
    sessionStorage.setItem("person", person);
    document.cookie="person=" + person;
    }
}

if (person !== null)
{
 changename();
}

drawTable();

if (!sessionStorage.getItem("person") && !getCookie()){
    document.addEventListener("DOMContentLoaded", function() { 
        const newuser = document.querySelector("#personform");
        newuser.addEventListener('submit', (event) =>{
            event.preventDefault();
            let name = newuser.elements['person'];
            if (name.value)
            {
                if(!re2.test(name.value)) alert("Name does not match required format!");
                else 
                {
                    person = name.value;
                    sessionStorage.setItem("person", person);
                    document.cookie="person=" + person;
                    personform.remove();
                    changename();
                    drawTable();
                }
            } else alert("Name cannot be empty!");
        })
    })
}

const checklist = document.querySelector("#additem");
checklist.addEventListener('submit', (event) =>{
    event.preventDefault();
    let personlist = { };
    if (localStorage.getItem(person))
    {
        personlist = JSON.parse(localStorage.getItem(person));
    }
    let item = checklist.elements['listitem'];
    let itemvalue = escapeSpecial(item.value);
    let error = 0;
    if(!re.test(itemvalue)) 
    {
        alert("Item does not match required format!");
        error = 1;
    }
    let qty = checklist.elements['qty']
    let qtyvalue = escapeSpecial(qty.value);
    if (!qtyvalue || isNaN(qtyvalue) || qtyvalue < 0)
    {
        alert("Quantity is not a number or is negative!");
        error = 1;
    }
    if (typeof(Storage) !== "undefined" && error === 0)
    {
        if (!(itemvalue in personlist)) personlist[itemvalue] = qtyvalue;
        else
        {
            let buf = personlist[itemvalue];
            buf = parseInt(qtyvalue) + parseInt(buf);
            if (isNaN(buf)) personlist[itemvalue] = qtyvalue;
            else personlist[itemvalue] = buf;
        }
        personlist = JSON.stringify(personlist);
        localStorage.setItem(person, personlist);
        drawTable();
    }
    else
    {
        alert("Web storage unavailable!");
    }
    const iteminput = document.getElementById("listitem");
    const qtyinput = document.getElementById("qty");
    iteminput.value = "";
    qtyinput.value = "";
})