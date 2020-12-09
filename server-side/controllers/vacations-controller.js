const express = require("express");
const multer = require("multer");
const fs = require("fs");

const vacationsLogic = require("../logic/vacations-logic");

const hostUrl = "http://localhost";

const router = express.Router();

// Upload images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + Date.now());
  },
});

let upload = multer({ storage: storage }).single("file");

router.post("/upload", function (request, response) {
  let token = request.headers.authorization;

  if (!vacationsLogic.isAdmin(token)) {
    throw new ServerError(ErrorType.ACCESS_DENIED);
  }

  upload(request, response, function (error) {
    if (error instanceof multer.MulterError) {
      console.log(error);
      return;
    } else if (error) {
      console.log(error);
      return;
    }

    if (request.body.fileToDelete != undefined) {
      request.body.fileToDelete = request.body.fileToDelete.slice(
        hostUrl + ":3001/".length,
        request.body.fileToDelete.length
      );
      deleteImage(request.body.fileToDelete);
    }

    request.file.filename = hostUrl + ":3001/" + request.file.filename;
    return response.status(200).send(request.file);
  });
});

// Delete image
function deleteImage(imageForDelete) {
  fs.unlinkSync("./uploads/" + imageForDelete);
  console.log("File deleted");
}

router.get("/", async (request, response, next) => {
  let token = request.headers.authorization;

  try {
    let successfulVacationsList = await vacationsLogic.getAllVacations(token);
    response.json(successfulVacationsList);
  } catch (error) {
    return next(error);
  }
});

router.post("/add", async (request, response, next) => {
  let token = request.headers.authorization;
  let vacation = request.body;

  try {
    let successfulNewVacation = await vacationsLogic.addVacation(vacation,token);
    response.json(successfulNewVacation);
  } catch (error) {
    return next(error);
  }
});

router.delete("/delete/:id", async (request, response, next) => {
  let token = request.headers.authorization;
  let vacationId = request.params.id;

  try {
    let imageForDelete = await vacationsLogic.deleteVacation(vacationId, token);

    deleteImage(imageForDelete);

    response.json();
  } catch (error) {
    return next(error);
  }
});

router.post("/follow/:id", async (request, response, next) => {
  let vacationId = request.params.id;
  let token = request.headers.authorization;
  try {
    await vacationsLogic.followVacation(vacationId, token);
    response.json();
  } catch (error) {
    return next(error);
  }
});

router.delete("/unfollow/:id", async (request, response, next) => {
  let vacationId = request.params.id;
  let token = request.headers.authorization;
  try {
    await vacationsLogic.unfollowVacation(vacationId, token);
    response.json();
  } catch (error) {
    return next(error);
  }
});

router.put("/update", async (request, response, next) => {
  let token = request.headers.authorization;
  let vacation = request.body;
  try {
    await vacationsLogic.updateVacation(vacation, token);
    response.json();
  } catch (error) {
    return next(error);
  }
});

router.get("/reports", async (request, response, next) => {
  let token = request.headers.authorization;

  try {
    let successfulFollowedVacationsList = await vacationsLogic.getFollowedVacationsList(token);
    response.json(successfulFollowedVacationsList);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
