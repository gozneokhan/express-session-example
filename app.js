/**
 * express-session은 세션 ID를 클라이언트에게 발급하고, 이 세션 ID를 통해 서버는 클라이언트의 상태를 추척할 수 있음.
 * 즉, 클라이언트가 세션ID를 발급받은 후에는 모든 서버 요청마다 세션 ID가 포함된 쿠키를 전달하게 되며, 이로 인해 서버는 클라이언트를 쉽게 식별 할 수 있게됨.
 */

import express from 'express';
import expressSession from 'express-session';

const app = express();
const SERVER_PORT = 3019;

app.use(express.json());
app.use(
    expressSession({
        // express-session은 middleware로 동작 -> 전역 미들웨어로 등록하는 app.use 방식으로 middelware 등록
        secret: 'express-session-secret-key', // 세션을 암호와하는 비밀 키를 설정
        resave: false, // 클라이언트의 요청이 올 때마다 세션을 새롭게 지정할 지 설정, 변경사항이 없어도 다시 저장 -> 결론적으로 저장하기 위한 리소스가 낭비되되기에 false로 설정
        saveUninitialized: false, // 세션이 초기화되지 않았을 때 세션을 저장할 지 설정 -> true로 설정 시 세션을 아무것도 할당하지 않았는데도 불구하고 별도의 세션 저장소가 생기게 되는 문제 발생 -> 리소스를 좀 더 먹을 수 있음
        cookie: {
            // 내부적으로 세션 ID가 담긴 쿠키를 전달할 때 설정하는 부분
            // 세션 쿠키 설정 -> cookie.maxAge를 통해 클라이언트가 며칠 정도 사용할 수 있는지 설정
            maxAge: 1000 * 60 * 60 * 24, // 쿠키의 만료 기간을 1일로 설정
        },
    })
);

/** session 등록 API **/
app.post('/sessions', (req, res, next) => {
    const { userId } = req.body;

    // 클라이언트에게 전달받은 userId를 세션에 저장 -> 이걸 저장하게 될 때, userId라고 하는 해당 키에다 전달 받은 userId 값을 할당하는 방식
    // req.session을 사용하면 이 안에 해당하는 데이터를 저장 할 수 있음. -> 저장하면 다음에 해당 클라이언트에게 해당 쿠키 발급되는데 그 쿠키에는 세션 ID가 할당
    // 세션 ID가 할당되어 있기 때문에 할당 된 세션 ID를 바탕으로 다시금 조회를 할 때에도 req.session을 동일하게 사용하면 저장한 userId값 또한 동일하게 가져올 수 있는 장점을 가짐.
    req.session.userId = userId;

    return res.status(201).json({ message: '세션 설정을 완료 하였습니다.' });
});

/** session 조회 API **/
app.get('/sessions', (req, res, next) => {
    console.log(req.session);
    /**
     * 출력:
     * 현재 클라이언트가 전달하는 쿠키 정보가 req.session에 할당되어 있고
     * 그 다음 실제로 저장한 req.sessions.userId 저장한 값이 조회되는걸 확인할 수 있음.
     */
    return res.status(200).json({
        message: '세션을 조회하였습니다.',
        session: req.session.userId ?? null, // 세션에 저장된 userId를 조회, 존재하지 않다면 null
    });
});

app.listen(SERVER_PORT, () => {
    console.log(SERVER_PORT, '포트로 서버가 열렸습니다.');
});

/**
 * express.js를 실행한 이 서버에서 저장이 되기 때문에 서버를 껏다 키게되면 데이터가 전부 소실
 * null 값 반환 ->
 * {
 *   "message": "세션을 조회하였습니다.",
 *   "session": null
 * }
 * 왜냐하면 세션 스토리지 같은 경우 express를 시작한 메모리 그 자체에 저장되는 인메모리 방식을 사용하고 있기 때문에
 * 서버를 껏다 키게 되었을 때, 해당하는 세션 데이터가 날아가는 문제가 발생할 수 있음.
 * 이런 문제를 해결하기 위해서 외부 세션 스토리지 MySQL이나 MongoDB 같은 여러가지 데이터베이스에 세션 데이터를 저장할 수 있음
 */

/**
 * console.log(req.session); 출력 값
 * Session {
 * cookie: {
 *   path: '/',
 *   _expires: 2024-04-22T15:00:59.355Z,
 *   originalMaxAge: 86400000,
 *   httpOnly: true
 * },
 * userId: 'Hello World'
 * }
 */
