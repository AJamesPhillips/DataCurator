
mkdir -p frontend/src/shared/models
mkdir -p frontend/src/shared/utils

cd frontend/src/shared
ln ../../../server/src/shared/api.ts       api.ts
ln ../../../server/src/shared/constants.ts constants.ts
ln ../../../server/src/shared/errors.ts    errors.ts
ln ../../../server/src/shared/paths.ts     paths.ts
cd -

cd frontend/src/shared/models
ln ../../../../server/src/shared/models/base.ts base.ts
ln ../../../../server/src/shared/models/user.ts user.ts
cd -

cd frontend/src/shared/utils
ln ../../../../server/src/shared/utils/date_helpers.ts date_helpers.ts
cd -
