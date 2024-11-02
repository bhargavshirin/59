const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../views/middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});



    router.post(
        "/signup", 
        wrapAsync(async (req, res) => {
        try {
            let { username, email, password } = req.body;
            const newUser = new User ({ email, username});
            const registeredUser = await User.register( newUser, password );
            console.log(registeredUser); // for see the hash and salt work
            req.login(registeredUser , (err) => {
                if (err) {
                    return next(err);
                }
            req.flash("success", "Welcome to WonderLust");
            res.redirect("/listings");
        });
    } catch(e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    })
    );

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post(
    "/login", 
    module.exports.saveRedirectUrl, 
    passport.authenticate("local", { 
        failureRedirect: "/login", 
        failureFlash: true,
     }),
async (req,res) => {
req.flash("success", "Welcome to WanderLust! You are logged in!!!!");
const redirectUrl = res.locals.redirectUrl || "/listings";
res.redirect(redirectUrl);
}
);
    
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect(req.session.redirectUrl);
    })
})

module.exports = router;