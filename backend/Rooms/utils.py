from agora_token_builder import RtcTokenBuilder
import time

def generate_agora_token(channel_name, uid, role="publisher"):
    app_id = "c4a3880238a342e8ad9487640a395329"
    app_certificate = "79012fc21b7a4c32b5022d39a0464328"
    expiration_time_in_seconds = 3600  # 1 hour

    current_timestamp = int(time.time())
    privilege_expired_ts = current_timestamp + expiration_time_in_seconds

    if role == "publisher":
        role_enum = 1  # Agora's Publisher role
    else:
        role_enum = 2  # Agora's Subscriber role

    token = RtcTokenBuilder.buildTokenWithUid(
        app_id, app_certificate, channel_name, uid, role_enum, privilege_expired_ts
    )
    return token
