const handleCreation = (e) => {
    e.preventDefault();

    $("#domoMessage").animate({width:'hide'}, 350);

    if($("#accountStr").val() == '') {
        handleError("RAWR! Fill in strength you fuck.");
        return false;
    }

    console.log($("input[name=_csrf]").val());

    sendAjax('POST', $("#accountForm").attr("action"), $("#accountForm").serialize(), redirect);

    return false;
};

const AccountForm = (props) => {
    return (
        <form id="accountForm"
            onSubmit={handleCreation}
            name="accountForm"
            action="/creator"
            method="POST"
            className="accountForm"
        >
            <label htmlFor="strength">Strength: </label>
            <input id="accountStr" type="text" name="str" placeholder="Account Strength"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="makeAccountSubmit" type="submit" value="Make Account"/>
        </form>
    );
};

const createAcountWindow = (csrf) => {
    ReactDOM.render(
        <AccountForm csrf={csrf} />,
        document.querySelector("#content")
    );
};

const setup = (csrf) => {
    createAcountWindow(csrf); // default view
};

const getToken = () => {
    sendAjax('GET', '/getToken', null, (result) => {
        setup(result.csrfToken);
    });
};

$(document).ready(function() {
    getToken();
});