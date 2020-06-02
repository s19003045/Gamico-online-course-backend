const courseService = require('../../services/courseService')

const courseController = {
  // 看單一課程介紹
  getCourseIntro: (req, res) => {
    return courseService.getCourseIntro(req, res, (data) => {
      return res.json(data)
    })
  },
  // 看單一課程內容
  getCourseLesson: (req, res) => {
    return courseService.getCourseLesson(req, res, (data) => {
      return res.json({ data })
    })
  },
  // (首頁)看所有課程
  getCourses: (req, res) => {
    return courseService.getCourses(req, res, (data) => {
      return res.json(data)
    })
  },
  // 依主類別篩選課程
  getMainCategoryCourse: (req, res) => {
    return courseService.getMainCategoryCourse(req, res, (data) => {
      return res.json(data)
    })
  },
  // 依次類別篩選課程
  getSubCategoryCourse: (req, res) => {
    return courseService.getSubCategoryCourse(req, res, (data) => {
      return res.json(data)
    })
  },
  // 搜尋課程
  getSearchCourses: (req, res) => {
    return courseService.getSearchCourses(req, res, (data) => {
      return res.json(data)
    })
  }
};

module.exports = courseController;

