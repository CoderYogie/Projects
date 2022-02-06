CREATE OR REPLACE TRIGGER SYSTEM.TRG_UPDATEVISITSMADE
  AFTER UPDATE OF visits_made ON customers
  FOR EACH ROW
BEGIN
  INSERT INTO logs
  VALUES
    (LOG_SEQ.nextval,
     USER,
     'UPDATE',
     SYSDATE,
     'CUSTOMERS',
     :old.cid);
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
/

