const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
    res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

const login = (request, response) => {
    const req = request;
    const res = response;
    
    // force cast top strings to cover some security flaws
    const username = `${req.body.username}`;
    const password = `${req.body.pass}`;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'RAWR! All fields are required' });
    };
    
    return Account.AccountModel.authenticate(username, password, (err, account) => {
        if (err || !account) {
            return res.status(401).json({ error: 'Wrong username or password' });
        }
        
        req.session.account = Account.AccountModel.toAPI(account);
        
        return res.json({ redirect: '/maker'}); // changed from maker so that I can go to the creator page
    })
};

const signup = (request, response) => {
    const req = request;
    const res = response;
    
    // cast to string to cover up some security flaws
    req.body.username = `${req.body.username}`;
    req.body.pass = `${req.body.pass}`;
    req.body.pass2 = `${req.body.pass2}`;
    
    if (!req.body.username || !req.body.pass || !req.body.pass2) { 
        return res.status(400).json({error: 'RAWR! All fields are requires'});
    }
    
    if (req.body.pass !== req.body.pass2) {
        return res.status(400).json({ error: 'RAWR! Passwords do not match'});
    }
    
    return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
        const accountData = {
            username: req.body.username,
            salt,
            password: hash,
        };
        
        const newAccount = new Account.AccountModel(accountData);
        
        const savePromise = newAccount.save();
        
        savePromise.then(() => {
            req.session.account = Account.AccountModel.toAPI(newAccount);
            
            return res.json({ redirect: '/creator' }); // changed from maker so that I can go to the creator page
        });
        
        savePromise.catch((err) => {
            console.log(err);
            
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Username already in use.'});
            }
            
            return res.status(400).json({ error: 'An error occured'});
        })
        
    });
};

const getAccount = (request, response) => {
    const req = request;
    const res = response;

    return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
        if (err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occurred' });
        }
        
        return res.json({ account: docs });
    });
};

const createStats = (request, response) => {
    const req = request;
    const res = response;

    return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
        const accountData = {
            username: req.body.username,
            strength: req.body.strength,
            salt,
            password: hash,
        };
        
        const updateAccount = accountData;
        
        const savePromise = updateAccount.save();
        
        savePromise.then(() => {
            req.session.account = Account.AccountModel.toAPI(newAccount);
            
            return res.json({ redirect: '/creator' }); // changed from maker so that I can go to the creator page
        });
        
        savePromise.catch((err) => {
            console.log(err);
            
            if (err.code === 11000) {
                return res.status(400).json({ error: 'Username already in use.'});
            }
            
            return res.status(400).json({ error: 'An error occured'});
        })
    
    });

};

const creatorPage = (req, res) => {
    Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
        if(err) {
            console.log(err);
            return res.status(400).json({ error: 'An error occurred' });
        }
        
        return res.render('app', { csrfToken: req.csrfToken(), account: docs });
    });
};

// not used
const makeDomo = (req, res) => {
    if (!req.body.name || !req.body.age) {
        return res.status(400).json({ error: 'RAWR! Both name and age are required' });
    }
    
    const domoData = {
        name: req.body.name,
        age: req.body.age,
        owner: req.session.account._id,
    };
    
    const newDomo = new Domo.DomoModel(domoData);
    
    const domoPromise = newDomo.save();
    
    
    domoPromise.then(() => res.json({ redirect: '/maker' }));
    
    domoPromise.catch((err) => {
        console.log(err);
        if(err.code === 11000) {
            return res.status(400).json({ error: 'Domo already exists.' });
        }
        
        return res.status(400).json({ error: 'An error occurred' });
    });
    
    return domoPromise;
};

const getToken = (request, response) => {
    const req = request;
    const res = response;

    const csrfJSON = {
        csrfToken: req.csrfToken(),
    };

    res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.getAccount = getAccount;
