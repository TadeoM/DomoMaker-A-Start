const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
    res.render('login');
};

const signupPage = (req, res) => {
    res.render('signup');
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
        
        return res.json({ redirect: '/maker'});
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
            
            return res.json({ redirect: '/maker' });
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

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signupPage = signupPage;
module.exports.signup = signup;