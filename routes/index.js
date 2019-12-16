const userController = require("../controllers/userController");
const courseController = require("../controllers/courseController");
const adminController = require("../controllers/adminController");
const assignController = require("../controllers/assignController");
const questController = require("../controllers/questController");
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

// helpers 用來取代 req.user 成 helpers.getUser(req) & 取代 req.isAuthenticated() 成 helpers.ensureAuthenticated(req)
const helpers = require("../_helpers");


module.exports = (app, passport) => {
  // 驗證使用者權限
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next();
    }
    res.redirect("/signin");
  };
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === "admin") {
        return next();
      }
      return res.redirect("/");
    }
    res.redirect("/signin");
  };

  //如果使用者訪問首頁，就導向 /courses 的頁面
  app.get("/", (req, res) => res.redirect("/courses"));

  app.get("/courses", courseController.getCourses);









  // 開課者建立課程
  app.get('/courses/create/:courseId/intro', userController.createCourseIntro)
  app.get('/courses/create/:courseId/step1', userController.createCourseStep1)
  app.get('/courses/create/:courseId/step2', userController.createCourseStep2)
  app.get('/courses/create/:courseId/step3', userController.createCourseStep3)
  app.get('/courses/create/:courseId/step4', userController.createCourseStep4)

  // 開課者可以查詢課程狀態、學生人數等
  app.get('/users/:id/teachCourses', userController.getTeachCourses)


};