/*
==================================================

ไฟล์: TextInput.tsx

ตำแหน่ง: src/components/common/

หน้าที่:
Input field มาตรฐานสำหรับฟอร์มต่าง ๆ ในระบบ
รองรับการกำหนด type, placeholder และ label

รับผิดชอบ:
- แสดง Input field พร้อม Label
- รองรับ type ต่าง ๆ เช่น text, password
- ส่งค่ากลับผ่าน onChange callback

ใช้งานร่วมกับ:
- AccountPanel (Login/Register forms)
- CheckoutPanel (Shipping form)

Export:
- TextInput

หมายเหตุ:
- ใช้ Tailwind CSS class "input" สำหรับ styling
- label อยู่ด้านบนของ input เสมอ

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Component ที่จำเป็น
// ======================================================

/**
 * จุดประสงค์:
 * สร้าง input field มาตรฐานที่มี label
 *
 * การทำงาน:
 * แสดง label และ input ที่เชื่อมกัน
 * เมื่อผู้ใช้พิมพ์จะเรียก onChange callback
 *
 * Parameter:
 * label (string) - ข้อความหัวข้อ
 * value (string) - ค่าปัจจุบัน
 * type (string) - ประเภท input (ค่าเริ่มต้น "text")
 * placeholder (string) - ข้อความตัวอย่าง (ไม่บังคับ)
 * onChange (function) - callback เมื่อค่าเปลี่ยน
 *
 * Return:
 * JSX Element
 *
 * หมายเหตุ:
 * type="password" จะซ่อนข้อความที่พิมพ์
 */
export function TextInput({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <input
        className="input mt-3 w-full text-sm text-[var(--color-text)]"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}