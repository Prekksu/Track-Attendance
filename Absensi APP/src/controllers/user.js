const db = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const moment = require("moment");
const private_key = process.env.private_key;

const userController = {
	insertUser: async (req, res) => {
		try {
			const { name, address, email, password, company_id } = req.body;
			// const salt = bcrypt.gemSalt(10);

			const hashPassword = await bcrypt.hash(password, 10);
			console.log(hashPassword);

			await db.User.create({
				name,
				address,
				email,
				password: hashPassword,
				company_id,
			});
			return await db.User.findAll().then((result) => {
				res.send(result);
			});
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	getUser: async (req, res) => {
		try {
			const { emna, password } = req.query;
			const user = await db.User.findOne({
				where: {
					[Op.or]: [
						{
							name: emna,
						},
						{
							email: emna,
						},
					],
				},
			});
			console.log(user);
			if (user) {
				const match = await bcrypt.compare(
					password,
					user.dataValues.password
				);
				console.log(match);
				if (match) {
					const payload = {
						id: user.dataValues.id,
					};
					const token = jwt.sign(payload, private_key, {
						expiresIn: "1d",
					});

					console.log(token);

					return res.send({
						message: "login berhasil",
						value: user,
						token: token,
					});
				} else {
					throw new Error("login gagal password salah");
				}
			} else {
				return res.send({
					message: "login gagal email/username belum terdaftar",
				});
			}
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	getUser2: async (req, res) => {
		try {
			const { emna, password } = req.query;
			const user = await db.User.findOne({
				where: {
					[Op.or]: [
						{
							name: emna,
						},
						{
							email: emna,
						},
					],
				},
			});
			console.log(user);
			if (user) {
				const match = await bcrypt.compare(
					password,
					user.dataValues.password
				);
				console.log(match);
				if (match) {
					const payload = {
						id: user.dataValues.id,
					};
					const generateToken = nanoid();
					console.log(nanoid());
					const token = await db.Token.create({
						expired: moment().add(1, "days").format(),
						token: nanoid(),
						payload: JSON.stringify(payload),
					});

					return res.send({
						message: "login berhasil",
						value: user,
						token: token.dataValues.token,
					});
				} else {
					throw new Error("login gagal");
				}
			} else {
				return res.send({
					message: "login gagal",
				});
			}
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				message: err.message,
			});
		}
	},
	getByToken: async (req, res) => {
		const { token } = req.query;
		let user = jwt.verify(token, private_key);
		user = await db.User.findOne({
			where: {
				id: user.id,
			},
		});
		delete user.dataValues.password;
		res.send(user);
	},
	getByToken2: async (req, res) => {
		try {
			const { token } = req.query;
			let p = await db.Token.findOne({
				where: {
					[Op.and]: [
						{
							token,
						},
						{
							expired: {
								[Op.gt]: moment(
									"00:00:00",
									"hh:mm:ss"
								).format(),
								[Op.lte]: moment().add(1, "d").format(),
							},
						},
					],
				},
			});
			console.log(moment().format());
			user = await db.User.findOne({
				where: {
					id: JSON.parse(p.dataValues.payload).id,
				},
			});
			delete user.dataValues.password;
			res.send(user);
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	},
	forgetPass: async (req, res) => {
		try {
			const { email } = req.query;
			const user = await db.User.findOne({
				where: {
					email: email,
				},
			});
			if (user.dataValues) {
				//check apa ada token yg mengarah ke id user tsb
				await db.Token.update(
					{
						valid: false,
					},
					{
						where: {
							payload: JSON.stringify({ id: user.dataValues.id }),
							status: "FORGOT-PASSWORD",
						},
					}
				);
				const payload = {
					id: user.dataValues.id,
				};
				const generateToken = nanoid();
				const token = await db.Token.create({
					expired: moment().add(5, "minutes").format(),
					token: generateToken,
					payload: JSON.stringify(payload),
					status: "FORGOT-PASSWORD",
				});
				return res.send({
					nav: "/forget/" + token.dataValues.token,
					message: "email ada",
					token: token.dataValues.token,
				});
			}
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	},
	changePass: async (req, res) => {
		try {
			const { id } = req.query;
			const { password } = req.body;
			const hashPassword = await bcrypt.hash(password, 10);
			await db.User.update(
				{
					password: hashPassword,
				},
				{
					where: {
						id: id,
					},
				}
			);
			await db.User.findOne({
				where: {
					id: id,
				},
			}).then((result) => {
				res.send(result);
			});
		} catch (err) {
			res.status(500).send({
				message: err.message,
			});
		}
	},
};

module.exports = userController;
