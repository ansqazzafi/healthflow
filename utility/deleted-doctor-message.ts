export function deletedDoctorMessage(deletedDoctorName, hospitalName) {
    const customMessageForDoctor = `Dear Dr. ${deletedDoctorName}, I hope   this message finds you well. We would like to inform you that you are no longer a part of ${hospitalName}. We sincerely appreciate all the contributions you’ve made during your time with us. Your dedication and service have been invaluable, and we wish you all the best in your future endeavors. Thank you once again for your time and effort at [Hospital Name].
        Warm regards,
        ${hospitalName}`

        return customMessageForDoctor
}