const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema}=require("../schema.js");
const   Listing = require("../models/listing.js");  
const {isLoggedIn} = require("../views/middleware.js"); 


const validateListing = (req, res,next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
    };


//Index Route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//New Route
router.get("/new", isLoggedIn, (req, res)=> {
  if (!req.isAuthenticated()) {
    req.flash("error", "you must be logged in to create a new listing");
    return res.redirect("/login");
  }  
  res.render("listings/new.ejs");
});

// Show Route with error handling and potential template data
router.get("../:id", async (req, res) => {
    let { id } = req.params;
    try {
      const listing = await Listing.findById(id).populate("reviews");
      if (!listing) {
        return res.status(404).send("Listing not found."); // Handle not found case
      }
      // You can add additional data for the template here (optional)
      res.render("/views/listings/show.ejs", { listing }); // Use 'listing'
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error"); // Handle unexpected errors
    }
  });

// Create Route
router.post("/", isLoggedIn, async (req, res, next) => {
    try {
        const newListing = new Listing (req.body.listing);     
        await newListing.save();
    res.redirect("/");
    } catch (err) {
        next(err);
    }
    });
    


//Edit Route
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const { id } = req.params;
  
    try {
      const listing = await Listing.findById(id);
  
      if (!listing) {
        return res.status(404).render("error", { message: "Listing not found" });
      }
  
      // Implement authorization checks here (e.g., check user roles, permissions)
  
      res.render("/edit.ejs", { listing });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", { message: "Internal server error" });
    }
  });

  // Update Route
 router.put("//:id", isLoggedIn, wrapAsync (async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400,"Send valid data for listing");
          }
    let { id } = req.params;
       await listing.findByIdAndUpdate(id, { ...req.body.listing });
       res.redirect('/${id}');
        })
    );
//Delete Route
    router.delete("/:id", isLoggedIn, async (req,res ) =>  {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete (id);
        console.log(deletedListing);
        res.redirect("/");
    });

    module.exports = router;
