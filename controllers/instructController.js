const db = require("../models");
const Course = db.Course
const User = db.User
const UserEnrollment = db.UserEnrollment
const Lesson = db.Lesson
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const instructController = {
  getDashboard: (req, res) => {
    //<<<<<<<測試階段，先建立假的 user(待建立登入路由後，即可移除下面程式碼) 
    req.user = { id: 1 }
    //>>>>>>>>

    return res.render('instructor')
  },
  getCourses: (req, res) => {
    //<<<<<<<測試階段，先建立假的 user(待建立登入路由後，即可移除下面程式碼) 
    req.user = { id: 1 }
    //>>>>>>>>

    // 定義 Model query 中的 where option
    const whereOption = req.query.filter_status ? [{ status: req.query.filter_status }] : [{
      status: {
        [Op.eq]: 'editted'
      }
    }, {
      status: {
        [Op.eq]: 'submitted'
      }
    }, {
      status: {
        [Op.eq]: 'intoMarket'
      }
    }, {
      status: {
        [Op.eq]: 'offMarket'
      }
    }]
    // filter_status 用於 handlebars
    let filter_status = req.query.filter_status ? req.query.filter_status : 'all'

    // 定義 Model query 中的 order option
    const orderOption = req.query.sortby ? [`${req.query.sortby}`, 'DESC'] : ['status', 'DESC']
    // sortby 用於 handlebars
    let sortby = req.query.sortby ? req.query.sortby : ''

    // 帶入 whereOption 及 orderOption
    Course.findAll({
      where: {
        UserId: req.user.id,
        [Op.or]: whereOption
      },
      order: [orderOption]
    })
      .then(courses => {
        return res.render('instructCourses', { courses, filter_status, sortby })
      })
  }
}

module.exports = instructController
