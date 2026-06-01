import os
import django
import sys
import sqlite3

sys.path.append('C:\\Users\\GODWIN K BENNY\\OneDrive\\Desktop\\scratch\\medisync_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medisync_backend.settings')
django.setup()

def seed_raw_sql():
    print("Connecting to sqlite database directly...")
    db_path = 'C:\\Users\\GODWIN K BENNY\\OneDrive\\Desktop\\scratch\\medisync_backend\\db.sqlite3'
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Enable foreign keys
    cur.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Clear out old data
    cur.execute("DELETE FROM hospital_prescriptionmedicine;")
    cur.execute("DELETE FROM hospital_prescription;")
    cur.execute("DELETE FROM hospital_bill;")
    cur.execute("DELETE FROM hospital_queue;")
    cur.execute("DELETE FROM hospital_appointment;")
    cur.execute("DELETE FROM hospital_feedback;")
    cur.execute("DELETE FROM hospital_doctor;")
    cur.execute("DELETE FROM hospital_patient;")
    cur.execute("DELETE FROM hospital_medicine;")
    
    # Reset autoincrement sequences
    cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('hospital_doctor', 'hospital_patient', 'hospital_medicine', 'hospital_appointment', 'hospital_queue', 'hospital_prescription', 'hospital_bill', 'hospital_feedback');")

    import datetime
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    date_str = datetime.date.today().strftime("%Y-%m-%d")

    # 2. Insert Doctors (10 Doctors)
    doctors = [
        ('DOC0001', 'Sarah Jenkins', 'Cardiology', '555-0101', 'sarah.j@medisync.com', 'Heart Center'),
        ('DOC0002', 'Michael Chen', 'Pediatrics', '555-0102', 'michael.c@medisync.com', "Children's Wing"),
        ('DOC0003', 'Emily Rodriguez', 'Neurology', '555-0103', 'emily.r@medisync.com', 'Brain & Spine'),
        ('DOC0004', 'James Wilson', 'General Practice', '555-0104', 'james.w@medisync.com', 'Outpatient'),
        ('DOC0005', 'William Davis', 'Orthopedics', '555-0105', 'william.d@medisync.com', 'Bone & Joint'),
        ('DOC0006', 'Olivia Martinez', 'Dermatology', '555-0106', 'olivia.m@medisync.com', 'Skin Care'),
        ('DOC0007', 'Alexander Brown', 'Psychiatry', '555-0107', 'alexander.b@medisync.com', 'Mental Health'),
        ('DOC0008', 'Sophia Taylor', 'Ophthalmology', '555-0108', 'sophia.t@medisync.com', 'Eye Care'),
        ('DOC0009', 'Daniel Anderson', 'ENT', '555-0109', 'daniel.a@medisync.com', 'Ear, Nose & Throat'),
        ('DOC0010', 'Mia Thomas', 'Gynecology', '555-0110', 'mia.t@medisync.com', "Women's Health")
    ]
    cur.executemany("INSERT INTO hospital_doctor (doctor_code, name, specialization, phone, email, department) VALUES (?, ?, ?, ?, ?, ?)", doctors)
    
    # 3. Insert Patients (15 Patients)
    patients = [
        ('PAT0001', 'Robert Taylor', 45, 'Male', '555-0201', '123 Oak St, City'),
        ('PAT0002', 'Maria Garcia', 32, 'Female', '555-0202', '456 Pine Ave, Town'),
        ('PAT0003', 'David Smith', 68, 'Male', '555-0203', '789 Elm Rd, Village'),
        ('PAT0004', 'Linda Brown', 29, 'Female', '555-0204', '321 Birch Ln, City'),
        ('PAT0005', 'James Johnson', 50, 'Male', '555-0205', '654 Cedar Ct, Town'),
        ('PAT0006', 'Patricia Williams', 41, 'Female', '555-0206', '987 Maple Dr, Village'),
        ('PAT0007', 'John Jones', 75, 'Male', '555-0207', '159 Walnut Way, City'),
        ('PAT0008', 'Jennifer Miller', 22, 'Female', '555-0208', '753 Cherry Blvd, Town'),
        ('PAT0009', 'Michael Davis', 38, 'Male', '555-0209', '852 Spruce St, Village'),
        ('PAT0010', 'Elizabeth Garcia', 55, 'Female', '555-0210', '951 Ash Ave, City'),
        ('PAT0011', 'William Rodriguez', 62, 'Male', '555-0211', '357 Fir Ln, Town'),
        ('PAT0012', 'Barbara Wilson', 47, 'Female', '555-0212', '456 Beech Rd, Village'),
        ('PAT0013', 'Richard Martinez', 33, 'Male', '555-0213', '123 Poplar Ct, City'),
        ('PAT0014', 'Susan Anderson', 28, 'Female', '555-0214', '789 Willow Dr, Town'),
        ('PAT0015', 'Joseph Taylor', 59, 'Male', '555-0215', '654 Sycamore Way, Village')
    ]
    cur.executemany("INSERT INTO hospital_patient (patient_code, name, age, gender, phone, address) VALUES (?, ?, ?, ?, ?, ?)", patients)

    # 4. Insert Medicines (15 Medicines)
    medicines = [
        ('MED0001', 'Amoxicillin 500mg', 120.50, 500),
        ('MED0002', 'Paracetamol 650mg', 45.00, 1000),
        ('MED0003', 'Lisinopril 10mg', 250.00, 300),
        ('MED0004', 'Omeprazole 20mg', 180.75, 450),
        ('MED0005', 'Ibuprofen 400mg', 65.25, 800),
        ('MED0006', 'Metformin 500mg', 150.00, 600),
        ('MED0007', 'Amlodipine 5mg', 220.50, 400),
        ('MED0008', 'Levothyroxine 50mcg', 110.25, 750),
        ('MED0009', 'Atorvastatin 20mg', 280.00, 350),
        ('MED0010', 'Azithromycin 250mg', 350.50, 200),
        ('MED0011', 'Losartan 50mg', 190.75, 550),
        ('MED0012', 'Albuterol Inhaler', 450.00, 150),
        ('MED0013', 'Gabapentin 300mg', 210.25, 480),
        ('MED0014', 'Sertraline 50mg', 175.50, 620),
        ('MED0015', 'Ciprofloxacin 500mg', 290.00, 250)
    ]
    cur.executemany("INSERT INTO hospital_medicine (medicine_code, name, price, stock_quantity) VALUES (?, ?, ?, ?)", medicines)

    # 5. Insert Appointments, Queues, Prescriptions, and Bills dynamically
    import random
    
    cur.execute("SELECT id, price FROM hospital_medicine")
    med_list = cur.fetchall()

    appt_count = 0
    bill_count = 0

    # Keep track of used slots to prevent UNIQUE constraint errors
    used_doc_slots = set()
    used_pat_slots = set()

    # Generate 25 random appointments
    for i in range(1, 26):
        pat_id = random.randint(1, 15)
        doc_id = random.randint(1, 10)
        
        # Find a unique time slot for both this doctor and this patient
        while True:
            hour = random.randint(9, 16)
            minute = random.choice(['00', '15', '30', '45'])
            appt_time = f"{hour:02d}:{minute}:00"
            doc_slot = (doc_id, appt_time)
            pat_slot = (pat_id, appt_time)
            
            if doc_slot not in used_doc_slots and pat_slot not in used_pat_slots:
                used_doc_slots.add(doc_slot)
                used_pat_slots.add(pat_slot)
                break

        # Mix of statuses
        status_choices = ['BOOKED', 'COMPLETED', 'COMPLETED', 'CANCELLED']
        status = random.choice(status_choices)

        # Insert Appointment
        cur.execute("INSERT INTO hospital_appointment (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)",
                    (pat_id, doc_id, date_str, appt_time, status))
        
        appt_id = cur.lastrowid
        appt_count += 1

        # Insert Queue
        wait_time = random.randint(0, 30) if status == 'BOOKED' else 0
        cur.execute("INSERT INTO hospital_queue (appointment_id, queue_number, estimated_wait_time) VALUES (?, ?, ?)",
                    (appt_id, appt_count, wait_time))

        if status == 'COMPLETED':
            # Create a Prescription
            notes = random.choice([
                "Patient advised to rest.",
                "Routine checkup. All good.",
                "Prescribed medication for 5 days.",
                "Follow up next week.",
                "Mild symptoms observed."
            ])
            cur.execute("INSERT INTO hospital_prescription (appointment_id, doctor_id, prescription_date, notes) VALUES (?, ?, ?, ?)",
                        (appt_id, doc_id, date_str, notes))
            presc_id = cur.lastrowid

            # Add 1 to 3 random medicines
            num_meds = random.randint(1, 3)
            selected_meds = random.sample(med_list, num_meds)
            
            total_med_cost = 0
            for med in selected_meds:
                med_id = med[0]
                med_price = med[1]
                qty = random.randint(5, 20)
                dosage = random.choice(["1-0-1", "1-1-1", "0-0-1", "1-0-0"])
                
                cur.execute("INSERT INTO hospital_prescriptionmedicine (prescription_id, medicine_id, dosage, quantity) VALUES (?, ?, ?, ?)",
                            (presc_id, med_id, dosage, qty))
                total_med_cost += (med_price * qty)

            # Insert Bill
            bill_status = random.choice(['PAID', 'UNPAID', 'PAID']) # Favor paid
            total_amount = total_med_cost + 500 # 500 consultation fee
            cur.execute("INSERT INTO hospital_bill (patient_id, appointment_id, amount, bill_date, status) VALUES (?, ?, ?, ?, ?)",
                        (pat_id, appt_id, total_amount, date_str, bill_status))

    # 6. Generate some Feedback
    for i in range(1, 10):
        pat_id = random.randint(1, 15)
        doc_id = random.randint(1, 10)
        rating = random.randint(3, 5)
        comments = random.choice([
            "Excellent care, thank you!",
            "Doctor was very thorough.",
            "Minimal wait time.",
            "Friendly staff and great doctor.",
            "Good overall experience."
        ])
        cur.execute("INSERT INTO hospital_feedback (patient_id, doctor_id, rating, comments, created_at) VALUES (?, ?, ?, ?, ?)",
                    (pat_id, doc_id, rating, comments, now_str))

    conn.commit()
    conn.close()
    print("Database seeded with massive dataset (10 Doctors, 15 Patients, 15 Medicines, 25 Appointments/Bills)!")

if __name__ == '__main__':
    seed_raw_sql()
