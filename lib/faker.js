const moment = require('moment');

const names = {
    male: 'Pedro,Luiz,Petter,Genival,João,Francisco,Bruno,Victor,Orcar,Gustavo,Osvaldo,Luiz,Ted,Jonas,Renato,Jonatas,Fernando,Julio,Cezar,Clemente,Bernando,Breno,Teobaldo,Tulio,José,Steve'.split(','),
    female: 'Tamires,Ana,Luiza,Jessica,Claudia,Tereza,Renata,Geovanna,Carla,Juliana,Maria,Fernanda,Julia,Debora,Morgana,Tatiane,Joana,Berenice,Olivia,Raissa,Larissa,Agatha,Marilia,Dayane,Camila,Rafaela'.split(',')
};
const surnames = 'da Silva,Gomez,Andrade,Gonzales,Sá,Ferreia,Oliveira,Goodman,Santos,Souza,Alves,Hernández,Müller,Smith,García,Zhang,Carvalho,Texeira,Rodrigues,de Almeida,do Nascimento,Ribeiro,Araújo,Bettencourt'.split(',');
const domains = 'gmail.com,hotmail.com,live.com,outlook.com,bol.com.br,yahoo.com'.split(',');
const dateref = (new Date(2018, 5, 1).getTime());

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

module.exports.name = (gnd = null) => {
    const gender = (gnd === 'male' || gnd === 'female') ? gnd : shuffle(['male', 'female'])[0];
    return [shuffle(names[gender])[0], shuffle(names[gender])[0], shuffle(surnames)[0]].join(' ');
}

module.exports.cpf = (dots = true) => {
    const rand = () => {
        return Math.round(Math.random() * 9);
    }

    const mod = (d, by) => {
        return Math.round(d - (Math.floor(d / by) * by));
    }
    
    let n1 = 0, n2 = 0, n3 = 0, 
        n4 = rand(), 
        n5 = rand(),
        n6 = rand(),
        n7 = rand(),
        n8 = rand(),
        n9 = rand(),
        d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;

    d1 = 11 - (mod(d1, 11));

    if (d1 >= 10) {
        d1 = 0;
    }

    let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;

    d2 = 11 - (mod(d2, 11));

    if (d2 >= 10) {
        d2 = 0;
    }

    return (dots) 
        ? `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`
        : `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

module.exports.email = () => {
    return ['kunai_', ((new Date).getTime() - dateref).toString(32), '@', shuffle(domains)[0]].join('');
}

module.exports.date = (format='YYYY-MM-DD', when = 'now') => {
    const DAY = 1000 * 60 * 60 * 24;
    const date = new Date();

    if (when === 'past' || when === 'future') {
        const diff = randint(1, 25000) * DAY;
        date.setTime(date.getTime() + (diff * ((when === 'past') ? -1 : 1)));
    }

    return moment(date).format(format);
}

module.exports.choice = (arr) => {
    return shuffle(arr)[0];
}

module.exports.masked_number = (mask) => {
    return mask.replace(/(\d)/g, (_, $1) => randint(0, Number($1)));
}

module.exports.password = (arr) => {
    const base = (new Date).getTime().toString(32);
    return shuffle(base.split('')).join('');
}