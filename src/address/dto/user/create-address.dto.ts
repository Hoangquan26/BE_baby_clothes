import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";
import { normalizeString } from "src/common/utils/str.util";

export class CreateAddressDTO {
    @IsString({message: 'Người dùng không hợp lệ'})
    @IsNotEmpty({message: 'Người dùng không hợp lệ'})
    userId: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: 'Tên không hợp lệ'})
    @IsNotEmpty({message: 'Tên không được bỏ trống'})
    @MinLength(3, {message: 'Tên không được ngắn hơn 3 ký tự'})
    @MaxLength(254, {message: 'Tên quá dài'})
    fullName: string

    @Transform((value) => normalizeString(value))
    @IsString({message: 'Số điện thoại không hợp lệ'})
    @IsNotEmpty({message: 'Số điện thoại không được bỏ trống'})
    @MinLength(5, {message: 'Số điện thoại không hợp lệ'})
    @MaxLength(31, {message: 'Số điện thoại quá dài'})
    @IsPhoneNumber("VN", {message: 'Số điện thoại VN không hợp lệ'})
    phone: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: 'Nhãn địa chỉ không hợp lệ'})
    @IsOptional()
    label?: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: "Tham số tỉnh thành không hợp lệ"})
    @IsNotEmpty({message: 'Tham số tỉnh thành không được bỏ trống'})
    @MaxLength(10, {message: 'Tham số tỉnh thành quá dài'})
    province: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: "Tham số quận/phường/xã không hợp lệ"})
    @IsNotEmpty({message: 'Tham số quận/phường/xã không được bỏ trống'})
    @MaxLength(10, {message: 'Tham số quận/phường/xã quá dài'})
    ward: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: 'Địa chỉ 1 không hợp lệ'})
    @IsNotEmpty({message: 'Địa chỉ 1 không được bỏ trống'})
    @MinLength(5, {message: 'Địa chỉ 1 phải có tối thiểu 5 ký tự'})
    @MaxLength(254, {message: 'Địa chỉ 1 quá dài'})
    addressLine1?: string;

    @Transform((value) => normalizeString(value))
    @IsString({message: 'Địa chỉ 2 không hợp lệ'})
    @IsNotEmpty({message: 'Địa chỉ 2 không được bỏ trống'})
    @MinLength(5, {message: 'Địa chỉ 2 phải có tối thiểu 5 ký tự'})
    @MaxLength(254, {message: 'Địa chỉ 2 quá dài'})
    addressLine2?: string;

    @IsString({message: 'Mã bưu chính không hợp lệ'})
    @IsOptional()
    postalCode?: string;

    @IsBoolean({message: 'Tham số địa chỉ mặc định không hợp lệ'})
    isDefaultShipping: boolean = false;
}