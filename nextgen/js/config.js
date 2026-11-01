// NextGen frontend settings.
// Stage 1 reads fictional demonstration data from /data. Stage 2 will point dataBaseUrl at the
// FastAPI backend, which must authenticate the user and only return member data to approved
// members (and only the fields each member has chosen to share).
export const CONFIG = Object.freeze({
  dataBaseUrl: 'data/',
  locale: 'en-GB',
  interestStorageKey: 'zocf.nextgen.activityInterest.v1',
  accessModeKey: 'zocf.nextgen.demoAccessMode',
  demoSignedInMemberId: 'chipo-m',
});
