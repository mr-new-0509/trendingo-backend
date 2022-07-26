const { ADMIN_EMAIL, SENDER_EMAIL } = require("../utils/constants");
const db = require("../utils/db");
const Sib = require("../utils/Sib");

/** Add a new order */
exports.addNewOrder = async (req, res) => {
  const {
    userId,
    telegramUsername,
    alternativeUsername,
    orderItems,
    originPrice,
    discountPercentage,
    realPrice
  } = req.body;

  let message = `
    <p><b>Orderer Info</b></p>
    <hr>
    <p>telegram username: ${telegramUsername}</p>
    <p>alternative telegram username: ${alternativeUsername}</p>
    <p>price: $${realPrice}</p>
    <p style="margin-top: 10px"><b>Orders</b></p>
    <hr>
  `;

  const tranEmailApi = new Sib.TransactionalEmailsApi();

  try {
    //  Save order
    let newOrder = (await db.query(`
      INSERT INTO orders (
        id_user, 
        telegram_username, 
        alternative_telegram_username, 
        origin_price, 
        discount_percentage, 
        sold_price
      ) VALUES (
        ${userId},
        '${telegramUsername}',
        '${alternativeUsername}',
        ${originPrice},
        ${discountPercentage},
        ${realPrice}
      )
    `));

    //  Save the services of order
    for (let i = 0; i < orderItems.length; i += 1) {
      let queryOfFields = `(id_order, service_type, service_title, price`;
      let queryOfValues = `(${newOrder.insertId}, '${orderItems[i].service_type}', '${orderItems[i].service_title}', ${orderItems[i].price}`;

      message += `
        <p style="margin-top: 5px;"><b>${i + 1}.</b></p>
        <p>type: ${orderItems[i].service_type}</p>
        <p>title: ${orderItems[i].service_title}</p>
      `;

      delete orderItems[i].service_type;
      delete orderItems[i].service_title;
      delete orderItems[i].price;

      for (let key in orderItems[i]) {
        queryOfFields += `, ${key}`;
        console.log(orderItems[i][key]);
        queryOfValues += `, '${orderItems[i][key]}'`;
        message += `<p>${key}: ${orderItems[i][key]}</p>`;
      }

      queryOfFields += ')';
      queryOfValues += ')';

      await db.query(`INSERT INTO order_items ${queryOfFields} VALUES ${queryOfValues};`);
    }
    let sender = { email: SENDER_EMAIL };
    let receivers = [{ email: ADMIN_EMAIL }];

    let mailOptions = {
      sender,
      to: receivers,
      subject: 'New Order',
      htmlContent: message
    };

    //  Send receiver an email.
    tranEmailApi.sendTransacEmail(mailOptions)
      .then((result) => {
        console.log('# result => ', result);
        return res.status(201).send('');
      })
      .catch(error => {
        console.log('# error => ', error);
        return res.status(500).send('');
      });

  } catch (error) {
    console.log('# error => ', error);
    return res.status(500).send('');
  }
};

exports.orderDevService = (req, res) => {
  const { dev_order_description, telegram_username, email } = req.body;
  const tranEmailApi = new Sib.TransactionalEmailsApi();
  let sender = { email };
  let receivers = [{ email: ADMIN_EMAIL }];

  let mailOptions = {
    sender,
    to: receivers,
    subject: 'Order of Development service',
    htmlContent: `
      <p>${dev_order_description}</p><br>
      ${telegram_username && (`<p>Telegram username: <b><a href="https://t.me/${telegram_username}">${telegram_username}</a></b></p>`)}
    `
  };

  //  Send receiver an email.
  tranEmailApi.sendTransacEmail(mailOptions)
    .then((result) => {
      console.log('# result => ', result);
      return res.status(200).send('');
    })
    .catch(error => {
      console.log('# error => ', error);
      return res.status(500).send('');
    });
};