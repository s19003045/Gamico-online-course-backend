const db = require("../models");
const Course = db.Course;
const User = db.User;
const UserEnrollment = db.UserEnrollment;
const Lesson = db.Lesson;
const LessonUser = db.LessonUser;
const CourseCategory = db.CourseCategory;
const CourseSubCategory = db.CourseSubCategory;
const Cart = db.Cart;
const Favorite = db.Favorite;
const imgur = require("imgur-node-api");
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const helpers = require("../_helpers");
const SortCourses = require("../public/js/sort_courses");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const courseService = {
  // 看單一課程介紹
  getCourseIntro: (req, res, callback) => {
    // 取得 courseId
    let courseId = req.params.courses_id;
    // 判斷使用者是否已登入
    let isLogin = req.user ? true : false
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 判別使用者是否已購買該課程
    let bought = true;
    if (userEnrolledId.indexOf(parseInt(req.params.courses_id)) === -1) {
      bought = false;
    }
    Course.findByPk(req.params.courses_id, {
      include: User
    }).then(course => {
      if (course) {
        // 判別使用者是否已收藏該課程
        return Favorite.findOne({
          where: {
            CourseId: course.id,
            UserId: req.user ? req.user.id : ''
          },
          include: [Course]
        }).then(favorite => {
          let isFavorited = favorite ? true : false
          return callback({
            status: 'success',
            message: '成功取得該課程內容',
            course,
            bought,
            isLogin,
            isFavorited
          })
        })
      } else {
        return callback({
          status: 'error',
          messages: '該課程不存在！'
        })
      }
    });
  },
  // 看單一課程內容
  getCourseLesson: (req, res, callback) => {
    // 取得 courseId
    let courseId = req.params.courses_id;
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 使用者未購買該課程
    if (userEnrolledId.indexOf(parseInt(req.params.courses_id)) === -1) {
      return callback({
        status: 'error',
        message: '您尚未購買此課程，無法觀看課程內容'
      })
    } else {
      // 使用者已購買該課程
      let lessonNumber = 1;
      if (req.query.lessonNumber) {
        lessonNumber = Number(req.query.lessonNumber);
      }
      Course.findByPk(req.params.courses_id).then(course => {
        if (course) {
          Lesson.findAll({
            attributes: ["lessonNumber", "title"],
            where: [{ visible: true }, { CourseId: course.id }]
          }).then(lessons => {
            Lesson.findOne({
              where: {
                lessonNumber: lessonNumber,
                CourseId: course.id
              },
              include: [{ model: LessonUser, where: { UserId: req.user.id } }]
            }).then(lesson => {
              let isfinished = false;
              if (lesson.LessonUsers) {
                isfinished = lesson.LessonUsers[0].isfinished;
              }

              return callback({
                status: 'success',
                message: '成功取得該課程內容',
                lesson,
                lessons,
                courseId: course.id,
                courseName: course.name,
                lessonNumber,
                isfinished: isfinished
              })
            });
          });
        } else {
          return callback({
            status: 'error',
            message: '該課程不存在！'
          })
        }
      });
    }
  },
  // (首頁)看所有課程
  getCourses: async (req, res, callback) => {
    // 判斷使用者是否已登入
    let isLogin = req.user ? true : false
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 登入使用者的最愛課程 Id
    let favoriteCourseId = []
    if (req.user) {
      req.user.FavoriteCourses.forEach(favorite => {
        favoriteCourseId.push(favorite.id)
      })
    }

    // 取得sort功能要依據哪個變數排序所有課程
    order = SortCourses(req.query.order);
    Course.findAll({
      attributes: [
        "id",
        "image",
        "name",
        "ratingAverage",
        "ratingCount",
        "studentCount",
        "totalTime",
        "price"
      ],
      where: [{ status: "intoMarket" }],
      order: [order]
    }).then(courses => {
      // 辨認課程是否被登入的使用者購買
      const data = courses.map(c => ({
        ...c.dataValues,
        enrolled: userEnrolledId.includes(c.dataValues.id),
        isFavorited: favoriteCourseId.includes(c.dataValues.id)
      }));

      if (!req.user) {
        return Cart.findOne({
          where: {
            id: req.session.cartId
          },
          include: [
            {
              model: Course,
              as: "items",
              attributes: ["id"]
            }
          ]
        }).then(cart => {
          // 購物車中商品數量
          let cartItemCount;
          let cartCountDisplay;
          if (cart) {
            cartItemCount = cart.items === undefined ? 0 : cart.items.length;
          } else {
            cartItemCount = 0;
          }
          // 購物車的商品數是否要顯示
          cartCountDisplay = cartItemCount === 0 ? false : true;

          return callback({
            status: 'success',
            message: '成功取得所有課程',
            courses: data,
            order: req.query.order,
            route: "all",
            reqUrl: req.url,
            cartItemCount,
            cartCountDisplay,
            isLogin
          })
        });
      } else {
        User.findByPk(req.user.id).then(user => {
          return Cart.findOne({
            where: {
              UserId: req.user.id
            },
            include: [
              {
                model: Course,
                as: "items",
                attributes: ["id"]
              }
            ]
          }).then(cart => {
            // 購物車中商品數量
            let cartItemCount;
            let cartCountDisplay;
            if (cart) {
              cartItemCount = cart.items === undefined ? 0 : cart.items.length;
            } else {
              cartItemCount = 0;
            }
            // 購物車的商品數是否要顯示
            cartCountDisplay = cartItemCount === 0 ? false : true;

            return callback({
              status: 'success',
              message: '成功取得所有課程',
              courses: data,
              order: req.query.order,
              route: "all",
              reqUrl: req.url,
              cartItemCount,
              cartCountDisplay,
              isLogin
            })
          });
        });
      }
    });
  },
  // 依主類別篩選課程
  getMainCategoryCourse: (req, res, callback) => {
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 取得sort功能要依據哪個變數排序所有課程
    order = SortCourses(req.query.order);
    CourseCategory.findOne({
      where: {
        name: req.params.mainCategoName
      }
    }).then(category => {
      // 找不到類別
      if (!category) {
        req.flash("error_messages", "目前尚未規劃該類別，本站將陸續新增！");
        res.redirect("/courses");
      } else {
        Course.findAll({
          attributes: [
            "id",
            "image",
            "name",
            "ratingAverage",
            "ratingCount",
            "studentCount",
            "totalTime",
            "price",
            "CourseCategoryId"
          ],
          where: [{ status: "intoMarket" }, { CourseCategoryId: category.id }],
          order: [order]
        }).then(courses => {
          // 該類別沒有任何課程
          if (courses.length === 0) {
            return callback({
              status: 'error',
              message: '目前該類別還沒有任何課程，本站將陸續新增！'
            })
          } else {
            // 辨認課程是否被登入的使用者購買
            const data = courses.map(c => ({
              ...c.dataValues,
              enrolled: userEnrolledId.includes(c.dataValues.id)
            }));
            return callback({
              status: 'success',
              message: '成功篩選課程',
              courses: data,
              order: req.query.order,
              route: "mainCate",
              mainCategoName: req.params.mainCategoName,
              reqUrl: req.url
            })
          }
        });
      }
    });
  },
  // 依次類別篩選課程
  getSubCategoryCourse: (req, res, callback) => {
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 取得sort功能要依據哪個變數排序所有課程
    order = SortCourses(req.query.order);
    CourseCategory.findOne({
      where: {
        name: req.params.mainCategoName
      }
    }).then(category => {
      // 找不到類別
      if (!category) {
        return callback({
          status: 'error',
          message: '目前尚未規劃該類別，本站將陸續新增！'
        })
      } else {
        CourseSubCategory.findOne({
          where: { name: req.params.subCategoName }
        }).then(subcategory => {
          if (!subcategory) {
            return callback({
              status: 'error',
              message: '目前還沒有該類別的課程，本站將陸續新增，不好意思！'
            })
          } else {
            // 依子類別撈取課程資料
            Course.findAll({
              attributes: [
                "id",
                "image",
                "name",
                "ratingAverage",
                "ratingCount",
                "studentCount",
                "totalTime",
                "price",
                "CourseCategoryId"
              ],
              where: [
                { status: "intoMarket" },
                { CourseCategoryId: category.id },
                { CourseSubCategoryId: subcategory.id }
              ],
              order: [order]
            }).then(courses => {
              // 該類別沒有任何課程
              if (courses.length === 0) {
                return callback({
                  status: 'error',
                  message: '目前該類別還沒有任何課程，本站將陸續新增！'
                })
              } else {
                // 辨認課程是否被登入的使用者購買
                const data = courses.map(c => ({
                  ...c.dataValues,
                  enrolled: userEnrolledId.includes(c.dataValues.id)
                }));
                return callback({
                  status: 'success',
                  message: '成功篩選課程',
                  courses: data,
                  order: req.query.order,
                  route: "subCate",
                  mainCategoName: req.params.mainCategoName,
                  subCategoName: req.params.subCategoName,
                  reqUrl: req.url
                })
              }
            });
          }
        });
      }
    });
  },
  // 搜尋課程
  getSearchCourses: (req, res, callback) => {
    // 登入使用者已購買的課程Id
    let userEnrolledId = [];
    if (req.user) {
      req.user.UserEnrollments.forEach(enroll => {
        userEnrolledId.push(enroll.CourseId);
      });
    }
    // 取得sort功能要依據哪個變數排序所有課程
    order = SortCourses(req.query.order);
    Course.findAll({
      attributes: [
        "id",
        "image",
        "name",
        "ratingAverage",
        "ratingCount",
        "studentCount",
        "totalTime",
        "price"
      ],
      where: [
        { status: "intoMarket" },
        {
          name: {
            [Op.like]: `%${req.query.keyword}%`
          }
        }
      ],
      order: [order]
    }).then(courses => {
      // 辨認課程是否被登入的使用者購買
      const data = courses.map(c => ({
        ...c.dataValues,
        enrolled: userEnrolledId.includes(c.dataValues.id)
      }));
      if (!req.user) {
        return callback({
          status: 'success',
          message: '成功取得課程',
          courses: data,
          order: req.query.order,
          route: "search",
          reqUrl: req.url,
          keyword: req.query.keyword
        })
      } else {
        User.findByPk(req.user.id).then(user => {
          return callback({
            status: 'success',
            message: '成功取得課程',
            courses: data,
            order: req.query.order,
            route: "search",
            reqUrl: req.url,
            keyword: req.query.keyword,
            user
          })
        });
      }
    });
  }
};

module.exports = courseService;
