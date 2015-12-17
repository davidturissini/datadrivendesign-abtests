'use strict';

const request = require('supertest');

const url = 'http://127.0.0.1:4000';

module.exports = function (abtest) {
    const abtestId = abtest.id;

    return new Promise(function (res, rej) {
        request(url)
            .post(`/abtests/${abtestId}/impressions`)
            .end(function (err, r) {
                const participantId = r.body.data.relationships.participant.data.attributes.key;
                const groupId = r.body.data.id;

                request(url)
                    .post(`/abtests/${abtestId}/conversions`)
                    .send({
                        data: {
                            type: 'participant',
                            id: participantId
                        }
                    })
                    .end(function (e, impressionsResponse) {
                        res({
                            participantId: participantId,
                            groupId: groupId,
                            impressionsResponse: impressionsResponse
                        });
                    });
            });
    });
}
