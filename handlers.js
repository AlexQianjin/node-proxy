import { http, HttpResponse } from 'msw';
import { getProtoBuffer } from './protohelper.js';

import GeneCoverage from './data/GeneCoverage.json' assert { type: 'json' };

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const geneResolver = ({ request, params, cookies }) => {
    const geneFake = {
        gene: 'gene1',
        coverage: 2,
        peptide: 10,
        deepNovoTags: 20,
        modifications: ['M', 'D']
    };
    const genes = [...Array(400).keys()].map((item, index) => ({
        ...geneFake,
        gene: `gene${index}`,
        coverage: getRandomInt(99),
        peptide: getRandomInt(99),
        deepNovoTags: getRandomInt(99)
    }));

    return HttpResponse.json(genes);
};
const geneHandler = http.get(/query\/(dda|dia)\/gene\/table\/*/, geneResolver);

const geneCoverageResolver = ({ request, params, cookies }) => {
    const result = getProtoBuffer('../proto/dto/peptide.proto', 'com.bsi.peaks.model.dto.peptide.GeneCoverage', GeneCoverage);

    return HttpResponse.arrayBuffer(result, {
        headers: {
            'Content-Type': 'application/protobuf'
        }
    });
};
const geneCoverageHandler = http.get(/query\/(dda|dia)\/gene\/coverage\/*/, geneCoverageResolver);

export const handlers = [
    // geneHandler
    geneCoverageHandler
];
