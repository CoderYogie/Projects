prompt PL/SQL Developer Export User Objects for user SYSTEM@XE
prompt Created by starx on Sunday, May 16, 2021
set define off
spool 1.log

prompt
prompt Creating sequence LOG_SEQ
prompt =========================
prompt
@@log_seq.seq
prompt
prompt Creating sequence PURCHASE_SEQ
prompt ==============================
prompt
@@purchase_seq.seq

prompt Done
spool off
set define on
