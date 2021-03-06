'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('CartItems', 'quantity', {
        type: Sequelize.INTEGER,
        after: 'id' // after option is only supported by MySQL
      })
    ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('CartItems', 'quantity')
    ])
  }
};
