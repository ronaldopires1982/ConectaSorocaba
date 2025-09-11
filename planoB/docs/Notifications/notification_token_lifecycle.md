# Notification Token Lifecycle Flow

## Overview

This diagram describes the complete lifecycle of push notification tokens in the Central156 system, from generation to expiration and renewal.

## Token Lifecycle Architecture

```mermaid
sequenceDiagram
    participant MA as Mobile App
    participant EPS as Expo Push Service
    participant FB as Firebase
    participant API as SuiteCRM API
    participant DB as MariaDB
    participant NHS as Notification System

    Note over MA,NHS: Token Generation and Registration

    MA->>MA: App startup / user login
    MA->>MA: Request notification permissions

    alt Permissions granted
        MA->>EPS: Request Expo Push Token
        Note right of MA: Project ID:<br/>a1d520f0-64ad-44ac-8d80-a8323ab1a0af

        EPS->>FB: Generate FCM token internally
        FB-->>EPS: FCM token generated
        EPS-->>MA: Expo Push Token
        Note left of EPS: Format:<br/>ExponentPushToken[ABC123...]

        MA->>MA: Collect device information
        Note right of MA: Device data:<br/>- Manufacturer<br/>- Model<br/>- OS Version<br/>- Device Type

        MA->>API: POST /api-register-device-tokenApp.php
        Note right of MA: Payload:<br/>expoToken<br/>userId (if logged in)<br/>deviceInfo

        API->>DB: Check if token exists
        DB-->>API: Token search result

        alt Token exists
            API->>DB: UPDATE token record
            Note right of API: Update:<br/>- last_used_c<br/>- device_info<br/>- user_id (if changed)
            DB-->>API: Update confirmed
            API-->>MA: Token updated successfully

        else New token
            API->>DB: INSERT new token record
            Note right of API: New record:<br/>- token_id_c<br/>- device_info<br/>- created_at_c<br/>- assigned_user_id
            DB-->>API: Token registered
            API-->>MA: Token registered successfully
        end

        MA->>MA: Store token locally (AsyncStorage)
        MA->>MA: Setup notification listeners

    else Permissions denied
        MA->>MA: Continue without notifications
        MA->>MA: Show notification setup reminder
    end

    Note over MA,NHS: Token Usage and Validation

    NHS->>DB: Query tokens for notification
    DB-->>NHS: Active tokens for user

    loop For each token
        NHS->>EPS: Send push notification
        Note right of NHS: Notification payload:<br/>to: token<br/>title, body<br/>data, sound

        alt Token valid
            EPS->>FB: Forward to Firebase
            FB-->>MA: Notification delivered
            MA->>MA: Handle notification
            EPS-->>NHS: Success response
            Note left of EPS: Response:<br/>status: "ok"<br/>id: notification_id

        else Token invalid/expired
            EPS-->>NHS: Error response
            Note left of EPS: Error:<br/>status: "error"<br/>message: "Invalid token"

            NHS->>DB: Mark token as invalid
            DB-->>NHS: Token deactivated
        end
    end

    Note over MA,NHS: Token Refresh and Cleanup

    MA->>MA: Periodic token refresh check
    MA->>EPS: Request fresh token
    EPS-->>MA: New/same token returned

    alt Token changed
        MA->>API: Update token in backend
        API->>DB: UPDATE with new token
        API->>DB: Deactivate old token
        DB-->>API: Token updated

    else Token unchanged
        MA->>API: Update last_used timestamp
        API->>DB: UPDATE last_used_c
        DB-->>API: Timestamp updated
    end
```
