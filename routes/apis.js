// import router module
const express = require('express')
const router = express.Router()

// import controllers
const courseController = require('../controllers/apis/courseController')


router.get('/', (req, res) => {
  return res.redirect('/apis/courses')
})

// 看全部課程
router.get("/courses", courseController.getCourses);
// 使用者可以搜尋課程
router.get("/courses/search", courseController.getSearchCourses);
// 看單一課程介紹
router.get("/courses/:courses_id/introduction", courseController.getCourseIntro);
// 使用者可以看單一課程的單元內容
router.get(
  "/courses/:courses_id/lessons",
  courseController.getCourseLesson
);
// 用主類別篩選課程
router.get("/courses/:mainCategoName", courseController.getMainCategoryCourse);
// 用次類別篩選課程
router.get(
  "/courses/:mainCategoName/:subCategoName",
  courseController.getSubCategoryCourse
);


module.exports = router