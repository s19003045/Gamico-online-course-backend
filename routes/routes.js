// import router module
const express = require('express')
const router = express.Router()

// import passport
const passport = require("../config/passport");

// import controllers
const userController = require("../controllers/userController");
const courseController = require("../controllers/courseController");
const adminController = require("../controllers/adminController");
const assignController = require("../controllers/assignController");
const postController = require("../controllers/postController");
const orderController = require("../controllers/orderController");
const cartController = require("../controllers/cartController");
const instructController = require("../controllers/instructController");
const createCourseController = require("../controllers/createCourseController");
const rewardController = require("../controllers/rewardController");

const multer = require("multer");
const upload = multer({ dest: "temp/" });

// helpers 用來取代 req.user 成 helpers.getUser(req) & 取代 req.isAuthenticated() 成 helpers.ensureAuthenticated(req)
const helpers = require("../_helpers");

// module.exports = (app, passport) => {
// 驗證使用者權限
const authenticated = (req, res, next) => {
  // 登入前請求的網址存進=> req.session
  req.session.returnTo = req.url;
  // 使用 passport 驗證使用者成功後，再把 req.session.returnTo 存至 cb(null,user) 的user中，便於 userController.signIn 使用
  console.log("======req.session.returnTo==index.js  authenticated==");
  console.log(req.session.returnTo);

  if (helpers.ensureAuthenticated(req)) {
    return next();
  }
  req.flash("success_messages", "請先登入");
  return res.redirect("/signin");
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
// 註冊/登入/登出
router.get("/signup", userController.signUpPage);
router.post("/signup", userController.signUp);

router.get("/signin", userController.signInPage);
router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signin",
    failureFlash: true
  }),
  userController.signIn
);
router.get("/logout", userController.logout);

//如果使用者訪問首頁，就導向 /courses 的頁面
router.get("/", (req, res) => {
  res.redirect("/courses");
});
// 看全部課程
router.get("/courses", courseController.getCourses);
// 使用者可以搜尋課程
router.get("/courses/search", courseController.getSearchCourses);
// 看單一課程介紹
router.get("/courses/:courses_id/introduction", courseController.getCourseIntro);

// 使用者可以看單一課程的單元內容
router.get(
  "/courses/:courses_id/lessons",
  authenticated,
  courseController.getCourseLesson
);

// 使用者可以在課程內容頁面勾選complete checkbox標註已完成的單元
router.post(
  "/courses/:courses_id/lessons/:lesson_id",
  authenticated,
  userController.postFinishLesson
);

// 使用者登入後可以看到問題討論區
router.get(
  "/courses/:courses_id/post",
  authenticated,
  postController.getCoursePost
);

// 使用者登入後可以針對課程發表問題
router.post(
  "/courses/:course_id/post",
  authenticated,
  postController.postDiscussPost
);

// 使用者登入後可以回覆課程問題
router.post(
  "/courses/:course_id/post/:post_id/reply",
  authenticated,
  postController.postDiscussReply
);

// 使用者登入後可以看到已購買的課程
router.get(
  "/users/boughtCourses",
  authenticated,
  userController.getBoughtCourses
);

// 開課者建立課程
router.get(
  "/courses/create/intro",
  authenticated,
  createCourseController.createCourseIntro
);
router.get(
  "/courses/create/:courseId/step1",
  authenticated,
  createCourseController.createCourseStep1
);
router.post(
  "/courses/create/:courseId/step1",
  authenticated,
  upload.single("image"),
  createCourseController.postCourseStep1
);
router.get(
  "/courses/create/:courseId/step2",
  authenticated,
  createCourseController.createCourseStep2
);
router.post(
  "/courses/create/:courseId/step2",
  authenticated,
  createCourseController.postCourseStep2
);
router.post(
  "/courses/create/:courseId/step2/createLessonTitle",
  authenticated,
  createCourseController.createLessonTitle
);
router.get(
  "/courses/create/:courseId/step2/:lessonId/edit",
  authenticated,
  createCourseController.editCourseStep2
);
// 刪除該lesson(disable 該lesson)
router.delete(
  "/courses/create/:courseId/step2/:lessonId",
  authenticated,
  createCourseController.deleteCourseStep2
);
// 異動 lesson 的 lessonNumber
router.put(
  "/courses/create/:courseId/step2/editLessonNumber",
  authenticated,
  createCourseController.editLessonNumber
);
// 修改 lesson 內容
router.put(
  "/courses/create/:courseId/step2/:lessonId",
  authenticated,
  createCourseController.putCourseStep2
);

router.get(
  "/courses/create/:courseId/step3",
  authenticated,
  createCourseController.createCourseStep3
);
router.put(
  "/courses/create/:courseId/step3",
  authenticated,
  createCourseController.putCourseStep3
);
router.get(
  "/courses/create/:courseId/step4/intro",
  authenticated,
  createCourseController.createCourseStep4Intro
);
router.get(
  "/courses/create/:courseId/step4/lessons",
  authenticated,
  createCourseController.createCourseStep4Lessons
);
router.get(
  "/courses/create/:courseId/step4/post",
  authenticated,
  createCourseController.createCourseStep4Post
);
router.post(
  "/courses/create/:courseId/step4",
  authenticated,
  createCourseController.postCourseStep4
);

//開課者dashboard
router.get(
  "/instructor/dashboard",
  authenticated,
  instructController.getDashboard
);
//於開課者dashboard 瀏灠所有課程
router.get("/instructor/courses", authenticated, instructController.getCourses);
//於開課者dashboard 瀏灠所有課程的學生
router.get(
  "/instructor/students",
  authenticated,
  instructController.getStudents
);
//於開課者dashboard 的課程審核討論區
router.get(
  "/instructor/course-review-discuss",
  authenticated,
  instructController.courseReviwDiscuss
);
// 留言於課程審核討論區
router.post(
  "/instructor/course-review-discuss/post",
  authenticated,
  instructController.leaveCourRevPost
);
// 回應於課程審核討論區
router.post(
  "/instructor/course-review-discuss/reply",
  authenticated,
  instructController.leaveCourRevReply
);
// router.get('/instructor/course/:courseId/', instructController.saleAnalysis)
// router.get('/instructor/course/:courseId', instructController.studentAnalysis)

//使用者可以看個人帳號資訊
router.get("/users/account", authenticated, userController.getUser);

//使用者可以看到收藏的課程清單
router.get(
  "/users/favoriteCourses",
  authenticated,
  userController.getFavoriteCourses
);

// 開課者可以查詢課程狀態、學生人數等
router.get(
  "/users/:id/teachCourses",
  authenticated,
  userController.getTeachCourses
);
// 使用者可以收藏課程
router.post(
  "/favorite/:courses_id",
  authenticated,
  userController.addFavoriteCourse
);

// 使用者可以加課程加入購物車
router.get("/cart", cartController.getCart);
// 使用者可以加課程加入購物車
router.post("/cart", cartController.postCart);
router.delete("/cartItem/:id", cartController.deleteCartItem);
// 購物車結帳
router.get("/cart/checkout", authenticated, cartController.checkoutCart);
// 查詢購物車中商品數量
router.get("/cart/checkcartitems", cartController.checkCartItems);

// ======訂單相關=====
// 取得訂單頁面
router.get("/orders", authenticated, orderController.getOrders);
// 將購物車的商品成立訂單
router.post("/order", authenticated, orderController.postOrder);
// 將訂單中的商品移至下次採買清單(放進購物車)
router.post(
  "/order/itemNextBuy",
  authenticated,
  orderController.removeToNextBuy
);
// 將訂單中的商品移除
router.post(
  "/order/cancelOrderItem",
  authenticated,
  orderController.cancelOrderItem
);
// 使用可以直接獲得課程(抽獎抽中)
router.post("/order/:courses_id", authenticated, orderController.orderCourse);
// 取消該筆訂單
router.post("/order/:id/cancel", authenticated, orderController.cancelOrder);

// 付款相關
router.get("/order/:id/payment", authenticated, orderController.getPayment);
router.post(
  "/courses/newebpay/callback",
  authenticated,
  orderController.newebpayCallback
);

// 用主類別篩選課程
router.get("/courses/:mainCategoName", courseController.getMainCategoryCourse);
// 用次類別篩選課程
router.get(
  "/courses/:mainCategoName/:subCategoName",
  courseController.getSubCategoryCourse
);

//admin dashboard
router.get(
  "/admin/dashboard",
  authenticated,
  authenticatedAdmin,
  adminController.getDashboard
);
//於admin dashboard 瀏灠所有課程
router.get(
  "/admin/dashboard/courses",
  authenticated,
  authenticatedAdmin,
  adminController.getCourses
);
//於admin dashboard 瀏灠所有課程的學生
router.get(
  "/admin/dashboard/students",
  authenticated,
  authenticatedAdmin,
  adminController.getStudents
);
//於admin dashboard 的課程審核討論區
router.get(
  "/admin/dashboard/course-review-discuss",
  authenticated,
  authenticatedAdmin,
  adminController.courseReviwDiscuss
);
// 留言於課程審核討論區
router.post(
  "/admin/dashboard/course-review-discuss/post",
  authenticated,
  authenticatedAdmin,
  adminController.leaveCourRevPost
);
// 回應於課程審核討論區
router.post(
  "/admin/dashboard/course-review-discuss/reply",
  authenticated,
  authenticatedAdmin,
  adminController.leaveCourRevReply
);

// 遊戲化：獎勵機制
router.get(
  "/reward/:userId/lottery",
  authenticated,
  rewardController.getLottery
);
router.post(
  "/reward/:userId/lottery",
  authenticated,
  rewardController.postLottery
);

// 獲取電子報
router.post("/subscribe/newsletter", userController.getNewsLetter);

module.exports = router

