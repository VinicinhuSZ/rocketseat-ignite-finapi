const { endpoint } = require("@ev-fns/endpoint");
const { v4: uuidv4 } = require("uuid");
const { HttpError } = require("@ev-fns/errors");
const { verificaContaId } = require("../functions/verificaConta");

const clientes = [];

exports.contasPostOne = endpoint((req, res) => {
  const { cpf, nome } = req.body;

  const clienteAlreadyExists = clientes.some((cliente) => cliente.cpf === cpf);

  if (clienteAlreadyExists) {
    throw new HttpError(400, "Cliente already exists!");
  }

  const id = uuidv4();

  clientes.push({
    cpf,
    nome,
    id,
    extratos: [],
  });

  res.status(201).end();
});

exports.contasGetMany = endpoint((_, res) => {
  res.status(200).json(clientes);
});

exports.contasGetOneExtratosGetMany = endpoint((req, res) => {
  const { id_conta } = req.params;

  const cliente = clientes.find((clienteObj) => clienteObj.id === id_conta);

  if (!cliente) {
    throw new HttpError(404, "cliente not found");
  }

  res.status(200).json(cliente.extratos);
});

exports.depositoPostOne = endpoint((req, res) => {
  const { descricao, valor } = req.body;
  const { id_conta } = req.headers;

  const { cliente } = verificaContaId(clientes, id_conta);

  const extratoOperacao = {
    descricao,
    valor,
    tipo: "crédito",
    created_at: new Date(),
  };

  cliente.extratos.push(extratoOperacao);

  res.status(200).json(extratoOperacao);
});
