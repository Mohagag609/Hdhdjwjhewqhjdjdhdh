"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreasuryController = void 0;
const common_1 = require("@nestjs/common");
const treasury_service_1 = require("./treasury.service");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ReceiptDto {
    partnerId;
    amount;
    date;
    method;
    reference;
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDto.prototype, "partnerId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ReceiptDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReceiptDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReceiptDto.prototype, "reference", void 0);
class PaymentDto {
    supplierId;
    amount;
    phaseId;
    materialItemId;
    date;
    method;
    reference;
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "phaseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentDto.prototype, "materialItemId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PaymentDto.prototype, "reference", void 0);
let TreasuryController = class TreasuryController {
    treasury;
    constructor(treasury) {
        this.treasury = treasury;
    }
    async balance(projectId) {
        const val = await this.treasury.getBalance(projectId);
        return { treasuryBalance: val.toNumber() };
    }
    async list(projectId) {
        return this.treasury.list(projectId);
    }
    async receipt(projectId, dto) {
        return this.treasury.receipt(projectId, dto);
    }
    async payment(projectId, dto) {
        return this.treasury.payment(projectId, dto);
    }
};
exports.TreasuryController = TreasuryController;
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TreasuryController.prototype, "balance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TreasuryController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ReceiptDto]),
    __metadata("design:returntype", Promise)
], TreasuryController.prototype, "receipt", null);
__decorate([
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, PaymentDto]),
    __metadata("design:returntype", Promise)
], TreasuryController.prototype, "payment", null);
exports.TreasuryController = TreasuryController = __decorate([
    (0, swagger_1.ApiTags)('treasury'),
    (0, common_1.Controller)('projects/:projectId/treasury'),
    __metadata("design:paramtypes", [treasury_service_1.TreasuryService])
], TreasuryController);
//# sourceMappingURL=treasury.controller.js.map