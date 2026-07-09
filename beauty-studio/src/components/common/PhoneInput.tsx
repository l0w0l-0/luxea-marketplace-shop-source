/*
==================================================

ไฟล์: PhoneInput.tsx

ตำแหน่ง: src/components/common/

หน้าที่:
Input เบอร์โทรศัพท์พร้อมรหัสประเทศ
ใช้ในฟอร์มสมัครสมาชิกเพื่อกรอกเบอร์โทร

รับผิดชอบ:
- แสดง input พร้อม dropdown เลือกประเทศ
- รองรับหลายประเทศ (TH, US, ES, MR)
- ส่งค่ารหัสประเทศและเบอร์โทรกลับผ่าน callback

ใช้งานร่วมกับ:
- AccountPanel (Register form)

Export:
- PhoneInput

หมายเหตุ:
- รหัสประเทศแสดงเป็นตัวย่อ 2 ตัวอักษร
- placeholder แสดงตัวอย่างรูปแบบเบอร์โทร

==================================================
*/

// ======================================================
// Imports
// นำเข้า Library และ Component ที่จำเป็น
// ======================================================

/**
 * จุดประสงค์:
 * สร้าง input เบอร์โทรศัพท์พร้อมเลือกประเทศ
 *
 * การทำงาน:
 * แสดง select สำหรับรหัสประเทศและ input สำหรับเบอร์โทร
 * ทั้งสองส่วนอยู่ใน container เดียวกัน
 *
 * Parameter:
 * label (string) - ข้อความหัวข้อ
 * country (string) - รหัสประเทศที่เลือก
 * number (string) - เบอร์โทรที่กรอก
 * onChangeCountry (function) - callback เมื่อเปลี่ยนประเทศ
 * onChangeNumber (function) - callback เมื่อเปลี่ยนเบอร์โทร
 *
 * Return:
 * JSX Element
 *
 * หมายเหตุ:
 * select อยู่ด้านซ้าย, input อยู่ด้านขวา
 * คั่นด้วยเส้น border
 */
export function PhoneInput({
  label,
  country,
  number,
  onChangeCountry,
  onChangeNumber,
}: {
  label: string;
  country: string;
  number: string;
  onChangeCountry: (country: string) => void;
  onChangeNumber: (number: string) => void;
}) {
  return (
    <label className="mt-5 block">
      <span className="text-sm font-bold text-[var(--color-text)]">
        {label}
      </span>
      <div className="relative mt-3">
        <div className="absolute inset-y-0 left-4 flex items-center gap-2 border-r border-[var(--color-border)] pr-3 text-sm font-bold text-[var(--color-text)]">
          <select
            className="bg-transparent outline-none"
            value={country}
            onChange={(event) => onChangeCountry(event.target.value)}
          >
            <option value="TH">TH</option>
            <option value="US">US</option>
            <option value="ES">ES</option>
            <option value="MR">MR</option>
          </select>
        </div>
        <input
          type="tel"
          placeholder="+66 8X XXX XXXX"
          className="input w-full pl-[5.5rem] text-sm text-[var(--color-text)]"
          value={number}
          onChange={(event) => onChangeNumber(event.target.value)}
        />
      </div>
    </label>
  );
}