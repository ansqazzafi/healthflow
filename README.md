# HealthFlow Hospital Management System - README

## Project Overview

HealthFlow is a comprehensive hospital management system designed to streamline the operations of hospitals, patients, doctors, and healthcare providers. The system includes various modules to facilitate user registration, appointment booking, patient care, payment management, and more. It provides efficient solutions for managing hospital departments, doctor appointments, and patient care. The following documentation outlines the key features and functionalities of the system.

---

## Modules

1. **Admin Module**
2. **Patient Module**
3. **Patient Care Module**
4. **Hospital Module**
5. **Doctor Module**

---

## Features

### 1. **Registration**

Users can register as the following types:
- **Hospital:** Hospital registration allows the hospital to manage its departments, doctors, and appointments.
- **User (Admin, Patient):** All users can register with unique roles.
    - Admin has the ability to manage and verify hospitals and doctors.
    - Patient can book appointments and manage them.
- **User ( Doctor, Patient Care):**
    - Doctor will have their profile with appointment management capabilities after verification.
    - Patient Care has access to appointment management and patient queries.

### 2. **Login**
-  (Hospital, admin, patient, doctor, and patient care) will log in using their registered credentials.
- Role-based access ensures each user has appropriate permissions.

### 3. **Patient Appointment System**
- **Appointment Booking:** 
    - Patients can book appointments with doctors through the hospital, but they cannot book appointments directly with doctors.
    - After booking, an SMS confirmation is sent to the patient's phone number for appointment confirmation.
  
- **Online Appointment System:**
    - Patients can opt for online consultations by paying a specified amount to the hospital.
    - After payment, a meeting link is sent to the patient with an expiry time for the meeting.
    - If the patient or doctor cancels the appointment more than 24 hours in advance, the amount will be refunded.

- **Appointment Management:**
    - Patients can manage their appointments by rescheduling, cancelling, or viewing appointment details.
    - A reminder is sent to the patient 24 hours before the scheduled appointment.

### 4. **Hospital Management**
- Hospitals can manage their **departments** and **doctor profiles**.
- The hospital has access to the **overall appointment system**, including the ability to delete appointments assigned to its doctors.

### 5. **Patient Care Module**
- Patient care professionals receive and manage patient queries.
- They have full access to appointments and can delete, update, or manipulate appointment records based on the patient’s requests.
- All queries and actions will be stored in the system for future reference and historical tracking.

### 6. **Doctor Verification**
- Doctors must undergo a verification process before they are listed as available for appointments.
- Only after verification can patients book appointments with the doctor.
- The hospital manages the doctor’s department, availability, and verification status.

### 7. **Admin Verification System**
- **Hospital Verification:** Admin verifies the hospital details. Once verification is complete, the hospital is made public and accessible to patients.
- **Doctor Verification:** Admin verifies the doctor’s credentials. Doctors cannot be associated with a hospital until they are verified.


### 8. **Chatbot Feature**
- **Predefined Question & Answer Flow:** 
    - Patients can interact with a chatbot that provides answers to common queries. 
    - The chatbot is equipped with predefined questions such as:
        - "How do I book an appointment?"
        - "What are the hospital's working hours?"
        - "What types of consultations are available?"
        - "How can I cancel or reschedule my appointment?"
    
    Patients simply select the query they are looking for from a list, and the chatbot will provide the relevant answer.

- **Contact Staff Option:** 
    - If the patient cannot find an answer through the chatbot, they can select the **'00' option**, which indicates they want to contact a **patient care staff** member for further assistance.
    - Once the patient selects this option, their details (name, contact info, and query) are sent directly to a patient care professional.
    - The patient care staff can then follow up and assist the patient as needed.


---

## Workflow

1. **Patient Registers:** The patient registers in the system and can log in to book appointments.
2. **Hospital Registration:** Hospitals register with necessary details, which are verified by the admin before being publicly listed.
3. **Doctor Registration and Verification:** Doctors also register and are verified by the admin. Once verified, they are listed in the hospital for appointment scheduling.
4. **Appointment Scheduling:**
    - Patients select a doctor via the hospital system.
    - They can opt for an online appointment and make the required payment to the hospital.
    - After payment, the meeting link and expiry time are shared with the patient.
5. **Payment & Confirmation:** 
    - A patient will receive a confirmation SMS once the appointment is scheduled.
    - If canceled 24 hours before the appointment, the amount is refunded.
6. **Patient Care Involvement:** Patient care professionals manage appointment updates, cancellations, and patient queries.

---

## Technologies Used
- **Backend:** Nest Js
- **Database:** Mongo-DB
- **SMS Service:** Twilio (for SMS notifications)
- **Payment Gateway Integration:** Stripe (for online appointment payments)
- **Authentication:** JWT (JSON Web Tokens)



Got it! If the `role` should be outside of the hospital registration object, here's the corrected version of the **POST /auth/register** endpoint with the `role` placed outside the hospital registration data.

---

### Authentication Endpoints

1. **POST /auth/register**
   - **Description**: Registers a new user. The password is hashed before storing.
   - **Request Body for Hospital**: 
     ```json
     {
       "role": "hospital",
       "hospital": {
         "name": "City Hospital",
         "email": "contact@cityhospital.com",
         "password": "password123",
         "phoneNumber": "+1234567890",
         "address": {
           "country": "USA",
           "city": "New York"
         },
         "medicalLicense": "XYZ123456789",
         "CEO": "Dr. John Doe",
         "biography": "A leading hospital providing excellent care to the community.",
         "departments": ["Cardiology", "Neurology", "Orthopedics"],
         "profilePicture": "https://example.com/profile.jpg"
       }
     }
     ```
   - **Request Body for Patient**: 
     ```json
     {
       "role": "patient",
       "patient": {
         "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "address": {
    "country": "USA",
    "city": "New York"
  },
  "phoneNumber": "+1234567890",
  "gender": "MALE",
  "profilePicture": "https://example.com/profile.jpg"
       }
     }
     ```
  
  