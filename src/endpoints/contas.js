const { endpoint } = require("@ev-fns/endpoint");
const { v4: uuidv4 } = require("uuid");
const { HttpError } = require("@ev-fns/errors");
const { verificaContaId } = require("../functions/verificaContaId");
const { verificaContaCpf } = require("../functions/verificaContaCpf");

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

exports.contasGetOne = endpoint((req, res) => {
  const { cpf } = req.params;

  const cliente = verificaContaCpf(clientes, cpf);

  res.status(200).json(cliente);
});

exports.contasGetOneExtratosGetMany = endpoint((req, res) => {
  const { id_conta } = req.params;

  const cliente = clientes.find((clienteObj) => clienteObj.id === id_conta);

  if (!cliente) {
    throw new HttpError(404, "cliente not found");
  }

  res.status(200).json(cliente.extratos);
});

exports.contasGetOneExtratosGetOne = endpoint((req, res) => {
  const { id_conta, data } = req.query;

  const dateFormat = new Date(data + " 00:00");

  const cliente = clientes.find((clienteObj) => clienteObj.id === id_conta);

  if (!cliente) {
    throw new HttpError(404, "cliente not found");
  }

  const extrato = cliente.extratos.filter(
    (extrato) =>
      extrato.created_at.toDateString() === new Date(dateFormat).toDateString(),
  );

  res.status(200).json(extrato);
});

exports.depositoPostOne = endpoint((req, res) => {
  const { descricao, valor } = req.body;
  const { id_conta } = req.headers;

  const cliente = verificaContaId(clientes, id_conta);

  const extratoOperacao = {
    descricao,
    valor,
    tipo: "crédito",
    created_at: new Date(),
  };

  cliente.extratos.push(extratoOperacao);

  res.status(200).json(extratoOperacao);
});

exports.saquePostOne = endpoint((req, res) => {
  const { descricao, valor } = req.body;
  const { id_conta } = req.headers;

  const { cliente } = verificaContaId(clientes, id_conta);

  const extratoOperacao = {
    descricao,
    valor,
    tipo: "débito",
    created_at: new Date(),
  };

  cliente.extratos.push(extratoOperacao);

  res.status(200).json(extratoOperacao);
});
