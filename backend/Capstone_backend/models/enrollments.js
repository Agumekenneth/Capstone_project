const sqlEnrollments = `CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    chapter_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
)`;
db.query(sqlEnrollments, (error) => {
    if (error) throw error;
    console.log("✅ Enrollments table ready");
});
