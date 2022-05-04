Moralis.initialize("HBlgUQT9jcJZTYVym7IhoYE6GRu9kd9qUQiZagLF"); // Application id from moralis.io
Moralis.serverURL = "https://j7pdzt8putp9.usemoralis.com:2053/server"; //Server url from moralis.io

async function login() {
    try {
        currentUser = Moralis.User.current();
        if(!currentUser){
            currentUser = await Moralis.Web3.authenticate();
        }
    } catch (error) {
        console.log(error);
    }
}

document.getElementById("login_button").onclick = login;